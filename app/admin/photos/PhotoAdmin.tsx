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
  /** Bumped each time the reference photo on disk changes, so the
   *  <img> in the "🎯 RÉFÉRENCE" pane reloads without cache. */
  referenceVersion?: number;
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
  existingPreviews = {},
  existingReferences = {},
  existingPublished = {},
}: {
  products: ProductRow[];
  disabled: boolean;
  /** Map of { handle: ["profile", "3quarter-front", ...] } pre-computed
   *  server-side by the page from .tmp/preview/. Used to hydrate the
   *  initial state so the ✅ Valider button is visible immediately. */
  existingPreviews?: Record<string, string[]>;
  /** Map of { handle: true } for products that already have a reference
   *  photo stored under .tmp/references/. Lets the "🎯 RÉFÉRENCE" pane
   *  show up at first paint without a client round-trip. */
  existingReferences?: Record<string, true>;
  /** Map of { handle: { deployUrl, at } } for products that already
   *  shipped. The default listing hides them — the operator only sees
   *  products that still need work. */
  existingPublished?: Record<string, { deployUrl?: string | null; at: string }>;
}) {
  const [filter, setFilter] = useState<string>("all");
  // Hydrate state directly from the SSR scan, then overlay anything we
  // saved in localStorage (validated flags, problematic flags) so the
  // operator's progress survives HMR reloads triggered by publishing a
  // product (which rewrites lib/products.ts → Next dev fast-refresh →
  // component remount).
  const [state, setState] = useState<Record<string, RowState>>(() => {
    const initial: Record<string, RowState> = {};
    for (const [handle, views] of Object.entries(existingPreviews)) {
      const viewsMap: Partial<Record<ViewKey, ViewState>> = {};
      for (const v of views) {
        viewsMap[v as ViewKey] = { version: 1 };
      }
      initial[handle] = { views: viewsMap };
    }
    for (const handle of Object.keys(existingReferences)) {
      initial[handle] = {
        ...(initial[handle] ?? { views: {} }),
        referenceUploaded: true,
        referenceVersion: 1,
      };
    }
    for (const [handle, entry] of Object.entries(existingPublished)) {
      initial[handle] = {
        ...(initial[handle] ?? { views: {} }),
        published: { url: entry.deployUrl ?? undefined },
      };
    }
    // Overlay client-only state from previous session.
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("photoAdmin.state.v1");
        if (raw) {
          const persisted = JSON.parse(raw) as Record<string, RowState>;
          for (const [handle, row] of Object.entries(persisted)) {
            const cur = initial[handle] ?? { views: {} };
            // Merge per-view: keep SSR version (disk truth) but overlay
            // validated flag from localStorage.
            const mergedViews: Partial<Record<ViewKey, ViewState>> = { ...cur.views };
            for (const [vk, vstate] of Object.entries(row.views ?? {})) {
              const ssrView = cur.views[vk as ViewKey];
              if (!ssrView) continue; // no disk preview — skip
              mergedViews[vk as ViewKey] = {
                ...ssrView,
                validated: vstate?.validated ?? false,
              };
            }
            initial[handle] = {
              ...cur,
              views: mergedViews,
              baseValidated: row.baseValidated ?? cur.baseValidated,
              problematic: row.problematic ?? cur.problematic,
            };
          }
        }
      } catch {/* ignore corrupt storage */}
    }
    return initial;
  });

  // Persist state to localStorage on every change so a publish-triggered
  // HMR doesn't wipe the validated flags.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Strip ephemeral fields (processing flags, errors, batch counters)
      // — keep only what's meaningful to restore.
      const compact: Record<string, RowState> = {};
      for (const [handle, row] of Object.entries(state)) {
        const views: Partial<Record<ViewKey, ViewState>> = {};
        for (const [vk, vstate] of Object.entries(row.views ?? {})) {
          if (vstate?.validated) views[vk as ViewKey] = { validated: true };
        }
        if (
          row.baseValidated ||
          row.problematic ||
          Object.keys(views).length > 0
        ) {
          compact[handle] = {
            views,
            baseValidated: row.baseValidated,
            problematic: row.problematic,
          };
        }
      }
      window.localStorage.setItem(
        "photoAdmin.state.v1",
        JSON.stringify(compact),
      );
    } catch {/* quota or disabled — fine */}
  }, [state]);

  useEffect(() => {
    // 1. Pull the problematic list so the chip + flag are restored
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

    // Preview hydration happens at SSR (see scanPreviews in page.tsx)
    // — no client fetch needed.
  }, []);

  const collections = useMemo(() => {
    const cs = new Set<string>();
    products.forEach((p) => cs.add(p.collection));
    return Array.from(cs);
  }, [products]);

  const filtered = useMemo(() => {
    // Default: hide products that already shipped. The whole point of
    // this studio is to grind through the REMAINING work — a published
    // product is done and clutters the list.
    if (filter === "all")
      return products.filter((p) => !state[p.handle]?.published);
    if (filter === "problematic")
      return products.filter((p) => state[p.handle]?.problematic);
    if (filter === "published")
      return products.filter((p) => state[p.handle]?.published);
    return products.filter(
      (p) => p.collection === filter && !state[p.handle]?.published,
    );
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
  const [batchGenerating, setBatchGenerating] = useState<
    null | { done: number; total: number; current?: string; failed: number }
  >(null);

  /**
   * Generate EVERY view (cover + 5 angles) for every product that isn't
   * published / flagged problematic. One task per (product, view), 6 per
   * product, processed with bounded concurrency. Skips any (product, view)
   * pair that already has a preview on disk so a restart picks up where
   * it left off without re-spending Gemini tokens.
   */
  async function generateAllBaseModels() {
    const ALL_VIEWS: ViewKey[] = [
      "profile",
      "3quarter-front",
      "3quarter-rear",
      "top",
      "shelf",
      "desk",
    ];
    const jobs: { handle: string; view: ViewKey; title: string }[] = [];
    for (const p of products) {
      const row = state[p.handle];
      if (row?.published) continue;
      // Note: we intentionally DO NOT skip problematic products — the
      // operator asked to regenerate everything. They can re-mark them
      // afterwards if a view is still unusable.
      for (const v of ALL_VIEWS) {
        if (row?.views[v]?.version) continue; // already exists — skip
        jobs.push({ handle: p.handle, view: v, title: p.title });
      }
    }
    if (jobs.length === 0) return;

    setBatchGenerating({ done: 0, total: jobs.length, failed: 0 });

    const CONCURRENCY = 4;
    let cursor = 0;
    let done = 0;
    let failed = 0;

    async function worker() {
      while (cursor < jobs.length) {
        const idx = cursor++;
        const j = jobs[idx];
        setBatchGenerating({
          done,
          total: jobs.length,
          current: `${j.title} · ${VIEW_LABEL[j.view]}`,
          failed,
        });
        setState((s) => {
          const prev = s[j.handle] ?? { views: {} };
          return {
            ...s,
            [j.handle]: {
              ...prev,
              views: {
                ...prev.views,
                [j.view]: { ...(prev.views[j.view] ?? {}), processing: true },
              },
            },
          };
        });
        try {
          const res = await fetch("/api/admin/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              handle: j.handle,
              view: j.view,
              useCurrent: true,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "process failed");
          setState((s) => {
            const prev = s[j.handle] ?? { views: {} };
            return {
              ...s,
              [j.handle]: {
                ...prev,
                views: {
                  ...prev.views,
                  [j.view]: {
                    ...prev.views[j.view],
                    processing: false,
                    version: (prev.views[j.view]?.version ?? 0) + 1,
                    validated: false,
                  },
                },
              },
            };
          });
          done++;
        } catch (e) {
          failed++;
          setState((s) => {
            const prev = s[j.handle] ?? { views: {} };
            return {
              ...s,
              [j.handle]: {
                ...prev,
                views: {
                  ...prev.views,
                  [j.view]: {
                    ...prev.views[j.view],
                    processing: false,
                    error: (e as Error).message,
                  },
                },
              },
            };
          });
        }
        setBatchGenerating({
          done,
          total: jobs.length,
          current: jobs[Math.min(cursor, jobs.length - 1)]
            ? `${jobs[Math.min(cursor, jobs.length - 1)].title} · ${VIEW_LABEL[jobs[Math.min(cursor, jobs.length - 1)].view]}`
            : undefined,
          failed,
        });
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
    setBatchGenerating(null);
  }

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
          onClick={generateAllBaseModels}
          disabled={disabled || !!batchGenerating || !!batchPublishing}
          title="Génère le modèle de base pour tous les produits qui n'en ont pas encore — 3 en parallèle"
          className="text-[0.85rem] font-bold px-5 py-2.5 rounded-full disabled:opacity-40 transition"
          style={{
            background: "linear-gradient(135deg, #ffb84d, #ff8c42)",
            color: "#06060f",
          }}
        >
          {batchGenerating
            ? `⚙️ ${batchGenerating.done}/${batchGenerating.total} photos…`
            : "🚀 Générer TOUTES les photos (6 par produit)"}
        </button>
        <button
          onClick={publishAllValidated}
          disabled={disabled || !!batchPublishing || !!batchGenerating || validatedBaseCount === 0}
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

      {/* Batch generation progress bar (when generating in batch) */}
      {batchGenerating && (
        <div className="mb-6 p-4 rounded-xl"
          style={{
            background: "rgba(255,140,66,0.08)",
            border: "1px solid rgba(255,180,77,0.35)",
          }}
        >
          <p className="text-[0.85rem] mb-2" style={{ color: "rgba(255,210,160,0.95)" }}>
            ⚙️ Génération en cours : {batchGenerating.current ?? ""}
            {batchGenerating.failed > 0 && (
              <span className="ml-3 text-red-400/85">
                ({batchGenerating.failed} échec{batchGenerating.failed > 1 ? "s" : ""})
              </span>
            )}
          </p>
          <div className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${(batchGenerating.done / batchGenerating.total) * 100}%`,
                background: "linear-gradient(90deg, #ffb84d, #ff8c42)",
              }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[0.65rem] text-white/50">
            {batchGenerating.done}/{batchGenerating.total} générés — 3 en parallèle, ~30-90s chacun
          </p>
        </div>
      )}

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

      {/* Category + status filter. Counts reflect REMAINING work
          (published products excluded) so the operator sees the actual
          workload at a glance. */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          À traiter ({products.filter((p) => !state[p.handle]?.published).length})
        </Chip>
        {collections.map((c) => {
          const n = products.filter(
            (p) => p.collection === c && !state[p.handle]?.published,
          ).length;
          if (n === 0) return null;
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
  const step2Ref = useRef<HTMLDivElement>(null);
  const baseState = rowState.views[BASE_VIEW] ?? {};
  // Free-form prompt instructions per view (e.g. "garde les bandes rouges").
  // Kept local to the card — not persisted; if the operator refreshes
  // they re-type. That's fine: it's a tool, not a setting.
  const [extraPromptByView, setExtraPromptByView] = useState<
    Partial<Record<ViewKey, string>>
  >({});

  // The instant baseValidated flips to true, scroll Step 2 into view AND
  // pulse a "✓ Modèle validé — angles en cours" banner so the operator
  // can see the click registered without scrolling.
  useEffect(() => {
    if (rowState.baseValidated && step2Ref.current) {
      step2Ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [rowState.baseValidated]);

  /** Run the pipeline for one view. Optionally use the reference photo
   *  and / or any free-form prompt instruction typed by the operator. */
  async function runPipeline(
    view: ViewKey,
    opts: { useReference?: boolean; extraPrompt?: string } = {},
  ) {
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
          extraPrompt: opts.extraPrompt || extraPromptByView[view] || "",
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
      ADDITIONAL_VIEWS.map(({ key }) =>
        runPipeline(key, { useReference: rowState.referenceUploaded }),
      ),
    );
  }

  async function validateView(view: ViewKey) {
    onUpdateView(view, { validated: true });
    if (view === BASE_VIEW) {
      // Step 2 is unlocked but the 5 angles are NOT auto-regenerated —
      // the global "🚀 Générer tout" button already populated them in
      // batch. The operator validates each angle individually instead.
      onUpdate({ baseValidated: true });
    }
  }

  async function uploadReference(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("handle", product.handle);
    try {
      const res = await fetch("/api/admin/reference", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "reference upload failed");
      onUpdate({
        referenceUploaded: true,
        referenceVersion: (rowState.referenceVersion ?? 0) + 1,
      });
      // Re-process the base view with the reference immediately
      await runPipeline(BASE_VIEW, { useReference: true });
    } catch (e) {
      onUpdate({ baseValidated: false });
      onUpdateView(BASE_VIEW, { error: (e as Error).message });
    }
  }

  /** Promote the currently-generated base preview to the reference slot.
   *  The next regeneration of the 5 angles will use it as the design
   *  guide for Gemini ("apply image 2's livery to image 1's airframe"). */
  async function keepAsReference() {
    try {
      const res = await fetch("/api/admin/reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: product.handle,
          promoteFromPreview: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "promote failed");
      onUpdate({
        referenceUploaded: true,
        referenceVersion: (rowState.referenceVersion ?? 0) + 1,
      });
    } catch (e) {
      onUpdateView(BASE_VIEW, { error: (e as Error).message });
    }
  }

  async function clearReference() {
    try {
      await fetch(
        `/api/admin/reference?handle=${encodeURIComponent(product.handle)}`,
        { method: "DELETE" },
      );
      onUpdate({ referenceUploaded: false });
    } catch {/* best-effort */}
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

  /** Drop the product from .tmp/published.json so it returns to the
   *  "À traiter" list. Useful when the operator wants to re-shoot a
   *  product that's already live. */
  async function unpublish() {
    onUpdate({ published: undefined });
    try {
      await fetch(
        `/api/admin/publish-product?handle=${encodeURIComponent(product.handle)}`,
        { method: "DELETE" },
      );
    } catch {/* best-effort */}
  }

  /** Mark this product as already-published WITHOUT going through the
   *  copy/rewrite/deploy flow. Used for legacy products that shipped
   *  before this workflow existed — the operator just wants to hide
   *  them from the "À traiter" list. */
  async function markAsAlreadyPublished() {
    onUpdate({ published: { url: undefined } });
    try {
      await fetch("/api/admin/publish-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: product.handle, markOnly: true }),
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
            <>
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
              <button
                onClick={unpublish}
                disabled={disabled}
                title="Retirer de la liste publiée — le produit réapparaîtra dans 'À traiter'"
                className="font-mono text-[0.6rem] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full transition"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                ↩️ Re-traiter
              </button>
            </>
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
          {!rowState.published && (
            <button
              onClick={markAsAlreadyPublished}
              disabled={disabled}
              title="Marquer comme déjà publié — le produit disparaît de la liste 'À traiter' (sans modification du site)"
              className="font-mono text-[0.65rem] tracking-[0.18em] uppercase px-3 py-1.5 rounded-full transition"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              ✅ Déjà fait
            </button>
          )}
        </div>
      </div>

      {/* Step 1 — BASE MODEL */}
      <div className="px-5 pb-5">
        <StepLabel n={1} label="Modèle de base" done={!!rowState.baseValidated} />

        <div className="grid md:grid-cols-[260px_1fr] gap-5 mt-3">
          {rowState.referenceUploaded ? (
            <ImagePane
              label="🎯 RÉFÉRENCE"
              src={`/api/admin/reference/${product.handle}?v=${rowState.referenceVersion ?? 1}`}
              tone="reference"
              caption="Cette photo guide Gemini pour les 5 angles."
              onClear={disabled ? undefined : clearReference}
            />
          ) : (
            <ImagePane label="ACTUEL" src={product.currentImage} />
          )}
          <div>
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
              onKeepAsReference={
                baseState.version && !rowState.referenceUploaded
                  ? keepAsReference
                  : undefined
              }
              disabled={disabled || baseState.processing}
            />
            {/* Operator instruction — appears once a preview exists so the
                operator can refine the next regeneration with a directive
                like "garde les bandes rouge/bleu sur le ventre". */}
            {baseState.version && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={extraPromptByView[BASE_VIEW] ?? ""}
                  onChange={(e) =>
                    setExtraPromptByView((m) => ({
                      ...m,
                      [BASE_VIEW]: e.target.value,
                    }))
                  }
                  placeholder='💬 Précise pour la prochaine régénération… (ex: "livrée Air France tricolore, bandes rouge et bleu sur le ventre")'
                  disabled={disabled}
                  className="w-full px-3 py-2 rounded-lg text-[0.8rem] outline-none"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                />
                <p className="mt-1 font-mono text-[0.6rem] text-white/35">
                  Tape ta consigne ici puis clique 🔄 sur la card image — elle est envoyée à Gemini en priorité.
                </p>
              </div>
            )}
          </div>
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
        <div
          ref={step2Ref}
          className="px-5 pb-5 border-t border-white/5 pt-5"
        >
          <StepLabel
            n={2}
            label={`5 angles supplémentaires (${validatedCount - 1}/5 validés)`}
            done={validatedCount === 6}
          />

          {/* Confirmation banner — proves the click registered */}
          {validatedCount === 1 && ADDITIONAL_VIEWS.some((v) => rowState.views[v.key]?.processing) && (
            <div
              className="mt-3 px-4 py-3 rounded-lg flex items-center gap-2"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(94,220,140,0.4)",
                animation: "pulse 1.8s ease-in-out infinite",
              }}
            >
              <span className="text-emerald-300 text-[0.85rem] font-semibold">
                ✓ Modèle de base validé
              </span>
              <span className="text-white/55 text-[0.78rem]">
                — les 5 angles sont en cours de génération (~30-60s par vue)
              </span>
            </div>
          )}

          <button
            onClick={generateAllAngles}
            disabled={disabled || ADDITIONAL_VIEWS.some((v) => rowState.views[v.key]?.processing)}
            className="mt-3 text-[0.78rem] font-semibold px-4 py-2 rounded-full disabled:opacity-40 transition"
            style={{
              background: "rgba(58,142,255,0.18)",
              border: "1px solid rgba(120,180,255,0.4)",
            }}
          >
            🔄 Re-générer les 5 angles
          </button>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {ADDITIONAL_VIEWS.map(({ key, label }) => {
              const v = rowState.views[key] ?? {};
              const slug =
                key === "profile" ? product.handle : `${product.handle}--${key}`;
              return (
                <div key={key}>
                  <ViewTile
                    label={label}
                    src={
                      v.version ? `/api/admin/preview/${slug}?v=${v.version}` : null
                    }
                    processing={!!v.processing}
                    validated={!!v.validated}
                    error={v.error}
                    onValidate={() => validateView(key)}
                    onRegenerate={() =>
                      runPipeline(key, {
                        useReference: rowState.referenceUploaded,
                      })
                    }
                    disabled={disabled}
                  />
                  {/* Per-tile prompt nudge — short input, same idea as the
                      base model: typed text is forwarded as extraPrompt
                      on the next 🔄 click. */}
                  {v.version && (
                    <input
                      type="text"
                      value={extraPromptByView[key] ?? ""}
                      onChange={(e) =>
                        setExtraPromptByView((m) => ({
                          ...m,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder="💬 Consigne pour 🔄"
                      disabled={disabled}
                      className="mt-2 w-full px-2.5 py-1.5 rounded-md text-[0.7rem] outline-none"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.85)",
                      }}
                    />
                  )}
                </div>
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
  tone,
  caption,
  onValidate,
  onRegenerate,
  onKeepAsReference,
  onClear,
  disabled,
}: {
  label: string;
  src: string | null;
  placeholder?: string;
  validated?: boolean;
  /** Visual style for the pane border. "reference" = blue accent. */
  tone?: "reference";
  /** Short helper line shown above the image, in the header. */
  caption?: string;
  /** When provided AND src is truthy, renders an action bar with Validate
   *  / Regenerate buttons under the image (same UX as the angle tiles). */
  onValidate?: () => void;
  onRegenerate?: () => void;
  /** Promote this pane's image to the reference slot. */
  onKeepAsReference?: () => void;
  /** Wipe the reference (only used when this pane IS the reference). */
  onClear?: () => void;
  disabled?: boolean;
}) {
  const hasActions =
    !!src && (onValidate || onRegenerate || onKeepAsReference || onClear);
  const borderColor =
    tone === "reference"
      ? "rgba(120,180,255,0.45)"
      : validated
        ? "rgba(34,197,94,0.55)"
        : "rgba(255,255,255,0.04)";
  return (
    <div
      className="rounded-xl overflow-hidden relative flex flex-col"
      style={{
        background: "#080810",
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="relative" style={{ aspectRatio: "1/1" }}>
        <span
          className="absolute top-2 left-2 z-10 font-mono text-[0.55rem] tracking-[0.18em] uppercase px-2 py-0.5 rounded"
          style={{
            background: "rgba(8,8,16,0.85)",
            color:
              tone === "reference"
                ? "#9cc6ff"
                : validated
                  ? "#7df09f"
                  : "rgba(255,255,255,0.55)",
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
      {caption && (
        <p
          className="px-2.5 py-1.5 font-mono text-[0.6rem] tracking-[0.06em] border-t border-white/5"
          style={{ color: "rgba(156,198,255,0.7)" }}
        >
          {caption}
        </p>
      )}
      {hasActions && (
        <div className="flex flex-wrap gap-1.5 p-2 border-t border-white/5">
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
          {onKeepAsReference && (
            <button
              onClick={onKeepAsReference}
              disabled={disabled}
              className="text-[0.72rem] font-semibold px-3 py-2 rounded-md disabled:opacity-40 transition"
              style={{
                background: "rgba(58,142,255,0.18)",
                border: "1px solid rgba(120,180,255,0.4)",
                color: "rgba(156,198,255,1)",
              }}
              title="Sauvegarder cette image comme référence design pour les 5 angles"
            >
              📌 Garder comme réf.
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
          {onClear && (
            <button
              onClick={onClear}
              disabled={disabled}
              className="text-[0.72rem] font-semibold px-3 py-2 rounded-md disabled:opacity-40 transition"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.55)",
              }}
              title="Supprimer la référence"
            >
              🗑️
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
