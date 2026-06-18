"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";

/*
 * Workflow per product (top → bottom on each card):
 *
 *   ┌─ Step 1 — Generate the BASE MODEL ─────────────────────┐
 *   │ "♻️ Générer modèle de base" (uses the product's       │
 *   │  current image as Gemini source)                        │
 *   │ → preview lands → operator decides:                     │
 *   │     ✅ Valider modèle      → unlocks Step 2             │
 *   │     🎨 Donner une référence → drag-drop a real photo,   │
 *   │                                 re-generate the base    │
 *   │     ⚠️ Photo problématique → flag for client follow-up  │
 *   └─────────────────────────────────────────────────────────┘
 *   ┌─ Step 2 — Generate the 5 ADDITIONAL ANGLES ────────────┐
 *   │ "🔄 Générer 5 angles supplémentaires"                  │
 *   │ → grid of 5 view tiles, each validatable individually   │
 *   └─────────────────────────────────────────────────────────┘
 *   ┌─ Step 3 — PUBLISH ──────────────────────────────────────┐
 *   │ "🚀 Publier sur le site" — commits + deploys ONLY the  │
 *   │ images the operator has validated.                      │
 *   └─────────────────────────────────────────────────────────┘
 */

type ProductRow = {
  handle: string;
  title: string;
  collection: string;
  currentImage: string;
  inStock: boolean;
};

type ViewKey =
  | "profile"
  | "3quarter-front"
  | "3quarter-rear"
  | "top"
  | "shelf"
  | "desk";

// Profile is the catalogue's existing format: square 1400×1400, plane on a
// wooden stand, transparent background → the card chrome takes over.
// Using it as the base view keeps the catalogue visually consistent —
// only the airplane itself changes between products.
const BASE_VIEW: ViewKey = "profile";
const ADDITIONAL_VIEWS: { key: ViewKey; label: string }[] = [
  { key: "3quarter-front", label: "3/4 avant" },
  { key: "3quarter-rear",  label: "3/4 arrière" },
  { key: "top",            label: "Dessus" },
  { key: "shelf",          label: "Sur étagère" },
  { key: "desk",           label: "Sur un bureau" },
];
const VIEW_LABEL: Record<ViewKey, string> = {
  profile: "Profil",
  "3quarter-front": "3/4 avant",
  "3quarter-rear": "3/4 arrière",
  top: "Dessus",
  shelf: "Sur étagère",
  desk: "Sur un bureau",
};

type ViewState = {
  processing?: boolean;
  version?: number; // bumped after each pipeline run to bust img cache
  validated?: boolean;
  error?: string;
};

type RowState = {
  baseValidated?: boolean;
  problematic?: boolean;
  referenceUploaded?: boolean;
  publishing?: boolean;
  published?: { url?: string };
  views: Partial<Record<ViewKey, ViewState>>;
};

const COLLECTION_LABEL: Record<string, string> = {
  airbus: "Airbus",
  boeing: "Boeing",
  concorde: "Concorde",
  jet: "Jet privé",
  chasse: "Aviation militaire",
  packs: "Packs",
};

export default function PhotoAdmin({
  products,
  disabled,
}: {
  products: ProductRow[];
  disabled: boolean;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [state, setState] = useState<Record<string, RowState>>({});

  useEffect(() => {
    fetch("/api/admin/problematic")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.items) return;
        setState((s) => {
          const next = { ...s };
          (data.items as { handle: string }[]).forEach((it) => {
            next[it.handle] = {
              ...(next[it.handle] ?? { views: {} }),
              problematic: true,
            };
          });
          return next;
        });
      })
      .catch(() => {});
  }, []);

  const collections = useMemo(() => {
    const cs = new Set<string>();
    products.forEach((p) => cs.add(p.collection));
    return Array.from(cs);
  }, [products]);

  const filtered = useMemo(() => {
    if (filter === "all") return products;
    if (filter === "problematic")
      return products.filter((p) => state[p.handle]?.problematic);
    if (filter === "published")
      return products.filter((p) => state[p.handle]?.published);
    return products.filter((p) => p.collection === filter);
  }, [products, filter, state]);

  const updateRow = useCallback(
    (handle: string, patch: Partial<RowState>) =>
      setState((s) => ({
        ...s,
        [handle]: { ...(s[handle] ?? { views: {} }), ...patch },
      })),
    [],
  );

  const updateView = useCallback(
    (handle: string, view: ViewKey, patch: Partial<ViewState>) =>
      setState((s) => {
        const row = s[handle] ?? { views: {} };
        return {
          ...s,
          [handle]: {
            ...row,
            views: { ...row.views, [view]: { ...row.views[view], ...patch } },
          },
        };
      }),
    [],
  );

  const problematicCount = useMemo(
    () => Object.values(state).filter((s) => s.problematic).length,
    [state],
  );
  const publishedCount = useMemo(
    () => Object.values(state).filter((s) => s.published).length,
    [state],
  );
  const validatedBaseCount = useMemo(
    () =>
      Object.values(state).filter(
        (s) => s.baseValidated && !s.published,
      ).length,
    [state],
  );

  const [batchPublishing, setBatchPublishing] = useState<
    null | { done: number; total: number; current?: string }
  >(null);

  /**
   * Publish every product that has its base model validated and isn't
   * already published. Runs sequentially (Vercel deploy at the end of
   * each is cheap because the FS update is the slow part).
   */
  async function publishAllValidated() {
    const candidates = products
      .map((p) => ({
        p,
        row: state[p.handle],
      }))
      .filter(({ row }) => row?.baseValidated && !row.published);

    if (candidates.length === 0) return;

    setBatchPublishing({ done: 0, total: candidates.length });

    for (let i = 0; i < candidates.length; i++) {
      const { p, row } = candidates[i];
      setBatchPublishing({
        done: i,
        total: candidates.length,
        current: p.title,
      });

      // Order of validated views — base first, then additional ones in
      // their declared order. Filter to only the ones the operator validated.
      const orderedKeys = ["profile", "3quarter-front", "3quarter-rear", "top", "shelf", "desk"] as const;
      const views = orderedKeys.filter((k) => row?.views[k]?.validated);
      if (views.length === 0) continue;

      try {
        const res = await fetch("/api/admin/publish-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Skip the per-product deploy — we batch one deploy at the end.
          body: JSON.stringify({
            handle: p.handle,
            views,
            deploy: i === candidates.length - 1, // only the last call triggers vercel
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setState((s) => ({
            ...s,
            [p.handle]: {
              ...(s[p.handle] ?? { views: {} }),
              published: { url: data.deployUrl },
            },
          }));
        }
      } catch {
        // best-effort — skip and continue
      }
    }
    setBatchPublishing(null);
  }

  return (
    <div>
      {/* Dashboard stats header */}
      <div
        className="rounded-2xl mb-8 p-5 flex flex-wrap items-center gap-4 md:gap-6"
        style={{
          background: "linear-gradient(145deg, #0c0c18, #07070f)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <StatBlock label="Catalogue" value={products.length} tone="default" />
        <Sep />
        <StatBlock
          label="Modèles validés"
          value={validatedBaseCount + publishedCount}
          sub={`${validatedBaseCount} prêts à publier`}
          tone="success"
        />
        <Sep />
        <StatBlock
          label="Publiés"
          value={publishedCount}
          tone="success"
        />
        <Sep />
        <StatBlock
          label="À redemander"
          value={problematicCount}
          tone="warning"
        />
        <div className="ml-auto" />
        <button
          onClick={publishAllValidated}
          disabled={disabled || !!batchPublishing || validatedBaseCount === 0}
          className="text-[0.85rem] font-bold px-5 py-2.5 rounded-full disabled:opacity-40 transition"
          style={{
            background:
              validatedBaseCount > 0
                ? "linear-gradient(135deg, #4ade80, #22c55e)"
                : "rgba(255,255,255,0.04)",
            color: validatedBaseCount > 0 ? "#06060f" : "rgba(255,255,255,0.4)",
          }}
        >
          {batchPublishing
            ? `🚀 Publication ${batchPublishing.done + 1}/${batchPublishing.total}…`
            : validatedBaseCount > 0
              ? `🚀 Publier les ${validatedBaseCount} validés`
              : "Aucun modèle prêt"}
        </button>
      </div>

      {/* Batch publishing progress bar (when active) */}
      {batchPublishing && (
        <div className="mb-6 p-4 rounded-xl"
          style={{
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(94,220,140,0.35)",
          }}
        >
          <p className="text-[0.85rem] text-emerald-300 mb-2">
            Publication en cours : {batchPublishing.current ?? ""}
          </p>
          <div className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${(batchPublishing.done / batchPublishing.total) * 100}%`,
                background: "linear-gradient(90deg, #4ade80, #22c55e)",
              }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[0.65rem] text-white/50">
            {batchPublishing.done}/{batchPublishing.total}
          </p>
        </div>
      )}

      {/* Category + status filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          Tout ({products.length})
        </Chip>
        {collections.map((c) => {
          const n = products.filter((p) => p.collection === c).length;
          return (
            <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {COLLECTION_LABEL[c] ?? c} ({n})
            </Chip>
          );
        })}
        {problematicCount > 0 && (
          <Chip
            active={filter === "problematic"}
            onClick={() => setFilter("problematic")}
            tone="warning"
          >
            ⚠️ À redemander ({problematicCount})
          </Chip>
        )}
        {publishedCount > 0 && (
          <Chip
            active={filter === "published"}
            onClick={() => setFilter("published")}
            tone="success"
          >
            🚀 Publiées ({publishedCount})
          </Chip>
        )}
      </div>

      {/* Cards stacked vertically — each card is its own workflow */}
      <div className="space-y-6">
        {filtered.map((p) => (
          <ProductCard
            key={p.handle}
            product={p}
            rowState={state[p.handle] ?? { views: {} }}
            disabled={disabled}
            onUpdate={(patch) => updateRow(p.handle, patch)}
            onUpdateView={(v, patch) => updateView(p.handle, v, patch)}
          />
        ))}
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "default" | "success" | "warning";
}) {
  const colors = {
    default: "rgba(120,180,255,0.85)",
    success: "#7df09f",
    warning: "#ffd28a",
  };
  return (
    <div className="flex flex-col">
      <span
        className="font-mono text-[0.55rem] tracking-[0.22em] uppercase"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        {label}
      </span>
      <span
        className="font-black text-[1.6rem] leading-tight"
        style={{ color: colors[tone] }}
      >
        {value}
      </span>
      {sub && (
        <span className="font-mono text-[0.6rem] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function Sep() {
  return (
    <div
      aria-hidden
      className="hidden md:block"
      style={{
        width: 1,
        height: 40,
        background: "rgba(255,255,255,0.08)",
      }}
    />
  );
}

function Chip({
  active,
  onClick,
  children,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "warning" | "success";
}) {
  const palettes = {
    default: { bg: "rgba(58,142,255,0.18)", border: "rgba(120,180,255,0.55)", text: "#fff" },
    warning: { bg: "rgba(255,170,50,0.18)", border: "rgba(255,180,80,0.55)", text: "#ffd28a" },
    success: { bg: "rgba(34,197,94,0.18)", border: "rgba(94,220,140,0.55)", text: "#7df09f" },
  } as const;
  const p = palettes[tone];
  return (
    <button
      onClick={onClick}
      className="font-mono text-[0.7rem] tracking-[0.18em] uppercase transition-all px-4 py-2 rounded-full"
      style={{
        background: active ? p.bg : "rgba(255,255,255,0.04)",
        border: active ? `1px solid ${p.border}` : "1px solid rgba(255,255,255,0.08)",
        color: active ? p.text : "rgba(255,255,255,0.55)",
      }}
    >
      {children}
    </button>
  );
}

function ProductCard({
  product,
  rowState,
  disabled,
  onUpdate,
  onUpdateView,
}: {
  product: ProductRow;
  rowState: RowState;
  disabled: boolean;
  onUpdate: (patch: Partial<RowState>) => void;
  onUpdateView: (view: ViewKey, patch: Partial<ViewState>) => void;
}) {
  const referenceInput = useRef<HTMLInputElement>(null);
  const baseState = rowState.views[BASE_VIEW] ?? {};

  /** Run the pipeline for one view. Optionally use the reference photo. */
  async function runPipeline(view: ViewKey, opts: { useReference?: boolean } = {}) {
    onUpdateView(view, { processing: true, error: undefined });
    try {
      const res = await fetch("/api/admin/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: product.handle,
          view,
          useCurrent: true,
          useReference: !!opts.useReference,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "process failed");
      onUpdateView(view, {
        processing: false,
        version: (rowState.views[view]?.version ?? 0) + 1,
        validated: false,
      });
    } catch (e) {
      onUpdateView(view, { processing: false, error: (e as Error).message });
    }
  }

  async function generateAllAngles() {
    await Promise.all(
      ADDITIONAL_VIEWS.map(({ key }) => runPipeline(key, { useReference: rowState.referenceUploaded })),
    );
  }

  async function validateView(view: ViewKey) {
    onUpdateView(view, { validated: true });
    if (view === BASE_VIEW) onUpdate({ baseValidated: true });
  }

  async function uploadReference(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("handle", product.handle);
    try {
      const res = await fetch("/api/admin/reference", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "reference upload failed");
      onUpdate({ referenceUploaded: true });
      // Re-process the base view with the reference immediately
      await runPipeline(BASE_VIEW, { useReference: true });
    } catch (e) {
      onUpdate({ baseValidated: false });
      onUpdateView(BASE_VIEW, { error: (e as Error).message });
    }
  }

  async function toggleProblematic() {
    const next = !rowState.problematic;
    onUpdate({ problematic: next });
    try {
      await fetch("/api/admin/problematic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: product.handle, remove: !next }),
      });
    } catch {/* best-effort */}
  }

  /** Pick the validated views in display order (base view first), copy them
   *  to public/images, rewrite products.ts, commit + deploy. */
  async function publishProduct() {
    const orderedAll: ViewKey[] = [BASE_VIEW, ...ADDITIONAL_VIEWS.map((v) => v.key)];
    const views = orderedAll.filter(
      (v) => rowState.views[v]?.validated,
    );
    if (views.length === 0) return;
    onUpdate({ publishing: true });
    try {
      const res = await fetch("/api/admin/publish-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: product.handle, views, deploy: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "publish failed");
      onUpdate({ publishing: false, published: { url: data.deployUrl } });
    } catch (e) {
      onUpdate({ publishing: false });
      onUpdateView(BASE_VIEW, { error: (e as Error).message });
    }
  }

  const validatedCount = ADDITIONAL_VIEWS.filter(
    (v) => rowState.views[v.key]?.validated,
  ).length + (baseState.validated ? 1 : 0);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0c0c18, #07070f)",
        border: rowState.problematic
          ? "1px solid rgba(255,170,50,0.55)"
          : rowState.published
            ? "1px solid rgba(34,197,94,0.45)"
            : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p
            className="font-mono text-[0.55rem] tracking-[0.22em] uppercase mb-1"
            style={{ color: "rgba(58,142,255,0.6)" }}
          >
            {COLLECTION_LABEL[product.collection] ?? product.collection}
            {!product.inStock && (
              <span className="ml-2 text-orange-400/80">· COMING SOON</span>
            )}
          </p>
          <h3 className="font-bold text-[1rem]">{product.title}</h3>
          <p className="font-mono text-[0.6rem] text-white/30 mt-0.5">
            {product.handle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {rowState.published && (
            <span
              className="font-mono text-[0.6rem] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(34,197,94,0.18)",
                color: "#7df09f",
                border: "1px solid rgba(94,220,140,0.45)",
              }}
            >
              🚀 Publié
            </span>
          )}
          <button
            onClick={toggleProblematic}
            disabled={disabled}
            className="font-mono text-[0.65rem] tracking-[0.18em] uppercase px-3 py-1.5 rounded-full transition"
            style={{
              background: rowState.problematic
                ? "rgba(255,170,50,0.2)"
                : "rgba(255,255,255,0.04)",
              border: rowState.problematic
                ? "1px solid rgba(255,180,80,0.55)"
                : "1px solid rgba(255,255,255,0.08)",
              color: rowState.problematic ? "#ffd28a" : "rgba(255,255,255,0.55)",
            }}
          >
            {rowState.problematic ? "⚠️ À redemander" : "🏷️ Problématique"}
          </button>
        </div>
      </div>

      {/* Step 1 — BASE MODEL */}
      <div className="px-5 pb-5">
        <StepLabel n={1} label="Modèle de base" done={!!rowState.baseValidated} />

        <div className="grid md:grid-cols-[260px_1fr] gap-5 mt-3">
          <ImagePane label="ACTUEL" src={product.currentImage} />
          <ImagePane
            label="MODÈLE DE BASE"
            src={
              baseState.version
                ? `/api/admin/preview/${product.handle}?v=${baseState.version}`
                : null
            }
            placeholder={
              baseState.processing
                ? "⚙️ Génération…"
                : "Clique sur 'Générer modèle de base' ↓"
            }
            validated={baseState.validated}
            // Action bar (Valider / Re-générer) shows up as soon as a preview
            // is available, so the operator never has to scroll to find the
            // green button.
            onValidate={
              baseState.version ? () => validateView(BASE_VIEW) : undefined
            }
            onRegenerate={
              baseState.version
                ? () =>
                    runPipeline(BASE_VIEW, {
                      useReference: rowState.referenceUploaded,
                    })
                : undefined
            }
            disabled={disabled || baseState.processing}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {!baseState.version && (
            <button
              onClick={() =>
                runPipeline(BASE_VIEW, {
                  useReference: rowState.referenceUploaded,
                })
              }
              disabled={disabled || baseState.processing}
              className="text-[0.78rem] font-semibold px-4 py-2 rounded-full disabled:opacity-40 transition"
              style={{
                background: "rgba(255,180,77,0.16)",
                border: "1px solid rgba(255,180,77,0.4)",
                color: "rgba(255,210,160,1)",
              }}
            >
              {baseState.processing ? "⚙️…" : "♻️ Générer modèle de base"}
            </button>
          )}

          {baseState.version && (
            <>
              <input
                type="file"
                ref={referenceInput}
                accept="image/png,image/jpeg,image/webp,image/heic"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadReference(f);
                }}
              />
              <button
                onClick={() => referenceInput.current?.click()}
                disabled={disabled || baseState.processing}
                className="text-[0.78rem] font-semibold px-4 py-2 rounded-full disabled:opacity-40 transition"
                style={{
                  background: rowState.referenceUploaded
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(58,142,255,0.18)",
                  border: rowState.referenceUploaded
                    ? "1px solid rgba(94,220,140,0.45)"
                    : "1px solid rgba(120,180,255,0.4)",
                }}
              >
                🎨{" "}
                {rowState.referenceUploaded
                  ? "Référence chargée — re-cliquer pour changer"
                  : "Donner une photo de référence"}
              </button>
            </>
          )}
        </div>

        {baseState.error && (
          <p className="mt-2 text-[0.78rem] text-red-400">⚠️ {baseState.error}</p>
        )}
      </div>

      {/* Step 2 — 5 ADDITIONAL ANGLES (locked until step 1 validated) */}
      {rowState.baseValidated && (
        <div className="px-5 pb-5 border-t border-white/5 pt-5">
          <StepLabel
            n={2}
            label={`5 angles supplémentaires (${validatedCount - 1}/5 validés)`}
            done={validatedCount === 6}
          />

          <button
            onClick={generateAllAngles}
            disabled={disabled || ADDITIONAL_VIEWS.some((v) => rowState.views[v.key]?.processing)}
            className="mt-3 text-[0.78rem] font-semibold px-4 py-2 rounded-full disabled:opacity-40 transition"
            style={{
              background: "rgba(58,142,255,0.18)",
              border: "1px solid rgba(120,180,255,0.4)",
            }}
          >
            🔄 Générer les 5 angles
          </button>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {ADDITIONAL_VIEWS.map(({ key, label }) => {
              const v = rowState.views[key] ?? {};
              const slug =
                key === "profile" ? product.handle : `${product.handle}--${key}`;
              return (
                <ViewTile
                  key={key}
                  label={label}
                  src={
                    v.version ? `/api/admin/preview/${slug}?v=${v.version}` : null
                  }
                  processing={!!v.processing}
                  validated={!!v.validated}
                  error={v.error}
                  onValidate={() => validateView(key)}
                  onRegenerate={() =>
                    runPipeline(key, { useReference: rowState.referenceUploaded })
                  }
                  disabled={disabled}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3 — PUBLISH (visible once at least the base is validated) */}
      {rowState.baseValidated && (
        <div className="px-5 pb-5 border-t border-white/5 pt-5 flex flex-wrap items-center gap-4">
          <StepLabel n={3} label="Publication" done={!!rowState.published} />

          <button
            onClick={publishProduct}
            disabled={disabled || rowState.publishing || validatedCount === 0 || !!rowState.published}
            className="text-[0.85rem] font-bold px-5 py-2.5 rounded-full disabled:opacity-40 transition"
            style={{
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              color: "#06060f",
            }}
          >
            {rowState.publishing
              ? "🚀 Publication…"
              : rowState.published
                ? "✓ Publié"
                : `🚀 Publier sur le site (${validatedCount} image${validatedCount > 1 ? "s" : ""})`}
          </button>

          {rowState.published?.url && (
            <a
              href={rowState.published.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.78rem] text-emerald-400 underline truncate max-w-md"
            >
              Voir le déploiement →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StepLabel({
  n,
  label,
  done,
}: {
  n: number;
  label: string;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-flex items-center justify-center font-bold text-[0.75rem] rounded-full"
        style={{
          width: 24,
          height: 24,
          background: done ? "rgba(34,197,94,0.18)" : "rgba(58,142,255,0.18)",
          border: done
            ? "1px solid rgba(94,220,140,0.45)"
            : "1px solid rgba(120,180,255,0.4)",
          color: done ? "#7df09f" : "#9cc6ff",
        }}
      >
        {done ? "✓" : n}
      </span>
      <span
        className="font-mono text-[0.65rem] tracking-[0.22em] uppercase"
        style={{ color: done ? "rgba(125,240,159,0.85)" : "rgba(255,255,255,0.75)" }}
      >
        {label}
      </span>
    </div>
  );
}

function ImagePane({
  label,
  src,
  placeholder,
  validated,
  onValidate,
  onRegenerate,
  disabled,
}: {
  label: string;
  src: string | null;
  placeholder?: string;
  validated?: boolean;
  /** When provided AND src is truthy, renders an action bar with Validate
   *  / Regenerate buttons under the image (same UX as the angle tiles). */
  onValidate?: () => void;
  onRegenerate?: () => void;
  disabled?: boolean;
}) {
  const hasActions = !!src && (onValidate || onRegenerate);
  return (
    <div
      className="rounded-xl overflow-hidden relative flex flex-col"
      style={{
        background: "#080810",
        border: validated
          ? "1px solid rgba(34,197,94,0.55)"
          : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="relative" style={{ aspectRatio: "1/1" }}>
        <span
          className="absolute top-2 left-2 z-10 font-mono text-[0.55rem] tracking-[0.18em] uppercase px-2 py-0.5 rounded"
          style={{
            background: "rgba(8,8,16,0.85)",
            color: validated ? "#7df09f" : "rgba(255,255,255,0.55)",
            backdropFilter: "blur(8px)",
          }}
        >
          {validated && "✓ "}
          {label}
        </span>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            className="w-full h-full object-contain"
            style={{ padding: "6%" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/25 text-[0.75rem] px-3 text-center">
            {placeholder ?? "—"}
          </div>
        )}
      </div>
      {hasActions && (
        <div className="flex gap-1.5 p-2 border-t border-white/5">
          {onValidate && (
            <button
              onClick={onValidate}
              disabled={disabled || validated}
              className="flex-1 text-[0.75rem] font-bold py-2 rounded-md disabled:opacity-40 transition"
              style={{
                background: validated
                  ? "rgba(34,197,94,0.15)"
                  : "linear-gradient(135deg, #4ade80, #22c55e)",
                color: validated ? "#7df09f" : "#06060f",
              }}
            >
              {validated ? "✓ Validé" : "✅ Valider"}
            </button>
          )}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={disabled}
              className="text-[0.75rem] font-semibold px-3 py-2 rounded-md disabled:opacity-40 transition"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              title="Re-générer cette image"
            >
              🔄
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ViewTile({
  label,
  src,
  processing,
  validated,
  error,
  onValidate,
  onRegenerate,
  disabled,
}: {
  label: string;
  src: string | null;
  processing: boolean;
  validated: boolean;
  error?: string;
  onValidate: () => void;
  onRegenerate: () => void;
  disabled: boolean;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden relative flex flex-col"
      style={{
        background: "#080810",
        border: validated
          ? "1px solid rgba(34,197,94,0.55)"
          : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="relative" style={{ aspectRatio: "1/1" }}>
        <span
          className="absolute top-2 left-2 z-10 font-mono text-[0.55rem] tracking-[0.18em] uppercase px-2 py-0.5 rounded"
          style={{
            background: "rgba(8,8,16,0.85)",
            color: validated ? "#7df09f" : "rgba(255,255,255,0.55)",
            backdropFilter: "blur(8px)",
          }}
        >
          {validated && "✓ "}
          {label}
        </span>
        {processing ? (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-[0.85rem]">
            ⚙️ Génération…
          </div>
        ) : src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            className="w-full h-full object-contain"
            style={{ padding: "6%" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/25 text-[0.75rem]">
            —
          </div>
        )}
      </div>
      {src && !processing && (
        <div className="flex gap-1.5 p-2 border-t border-white/5">
          <button
            onClick={onValidate}
            disabled={disabled || validated}
            className="flex-1 text-[0.7rem] font-bold py-1.5 rounded-md disabled:opacity-40 transition"
            style={{
              background: validated
                ? "rgba(34,197,94,0.15)"
                : "linear-gradient(135deg, #4ade80, #22c55e)",
              color: validated ? "#7df09f" : "#06060f",
            }}
          >
            {validated ? "✓ Validée" : "✅ Valider"}
          </button>
          <button
            onClick={onRegenerate}
            disabled={disabled}
            className="text-[0.7rem] font-semibold px-3 py-1.5 rounded-md disabled:opacity-40 transition"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            title="Re-générer cette vue"
          >
            🔄
          </button>
        </div>
      )}
      {error && (
        <p className="px-2 pb-2 text-[0.7rem] text-red-400 truncate" title={error}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
