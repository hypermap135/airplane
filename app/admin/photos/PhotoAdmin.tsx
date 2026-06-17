"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

type ProductRow = {
  handle: string;
  title: string;
  collection: string;
  currentImage: string;
  inStock: boolean;
};

type ViewKey = "profile" | "3quarter-front" | "3quarter-rear" | "top" | "shelf";

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "profile",         label: "Profil" },
  { key: "3quarter-front",  label: "3/4 avant" },
  { key: "3quarter-rear",   label: "3/4 arrière" },
  { key: "top",             label: "Dessus" },
  { key: "shelf",           label: "Sur étagère" },
];

type ViewState = {
  processing?: boolean;
  version?: number; // bumped after each pipeline run to bust img cache
  approved?: boolean;
  error?: string;
};

type RowState = {
  sourcePath?: string;
  problematic?: boolean;
  // Per-view state: profile / 3quarter-front / etc.
  views?: Partial<Record<ViewKey, ViewState>>;
};

type FolderFile = { name: string; path: string };

const COLLECTION_LABEL: Record<string, string> = {
  airbus: "Airbus",
  boeing: "Boeing",
  concorde: "Concorde",
  jet: "Jet privé",
  chasse: "Aviation militaire",
  packs: "Packs",
};

const FOLDER_KEY = "airplanestore.admin.folder";
const DEFAULT_FOLDER = "~/Downloads";

function matchScore(filename: string, product: ProductRow): number {
  const fn = filename.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const handle = product.handle.toLowerCase().replace(/-/g, " ");
  const title = product.title.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  let score = 0;
  if (fn.includes(handle)) score += 100;
  title.split(" ").filter((w) => w.length > 2).forEach((w) => {
    if (fn.includes(w)) score += 10;
  });
  return score;
}

export default function PhotoAdmin({
  products,
  disabled,
}: {
  products: ProductRow[];
  disabled: boolean;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [folder, setFolder] = useState<string>(DEFAULT_FOLDER);
  const [scanned, setScanned] = useState<FolderFile[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | undefined>();
  const [state, setState] = useState<Record<string, RowState>>({});
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<string | undefined>();

  useEffect(() => {
    const saved = localStorage.getItem(FOLDER_KEY);
    if (saved) setFolder(saved);
    // hydrate problematic list
    fetch("/api/admin/problematic")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.items) return;
        setState((s) => {
          const next = { ...s };
          (data.items as { handle: string }[]).forEach((it) => {
            next[it.handle] = { ...next[it.handle], problematic: true };
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
    return products.filter((p) => p.collection === filter);
  }, [products, filter, state]);

  const updateRow = useCallback(
    (handle: string, patch: Partial<RowState>) =>
      setState((s) => ({ ...s, [handle]: { ...s[handle], ...patch } })),
    [],
  );

  const updateView = useCallback(
    (handle: string, view: ViewKey, patch: Partial<ViewState>) =>
      setState((s) => {
        const row = s[handle] ?? {};
        const views = row.views ?? {};
        return {
          ...s,
          [handle]: {
            ...row,
            views: { ...views, [view]: { ...views[view], ...patch } },
          },
        };
      }),
    [],
  );

  async function handleScan() {
    setScanning(true);
    setScanError(undefined);
    localStorage.setItem(FOLDER_KEY, folder);
    try {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "scan failed");
      setScanned(data.files);
      const auto: Record<string, RowState> = {};
      products.forEach((p) => {
        if (state[p.handle]?.sourcePath) return;
        const ranked = data.files
          .map((f: FolderFile) => ({ f, score: matchScore(f.name, p) }))
          .filter((x: { score: number }) => x.score > 0)
          .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
        if (ranked.length > 0) auto[p.handle] = { sourcePath: ranked[0].f.path };
      });
      setState((s) => {
        const merged = { ...s };
        Object.entries(auto).forEach(([h, v]) => {
          merged[h] = { ...merged[h], ...v };
        });
        return merged;
      });
    } catch (e) {
      setScanError((e as Error).message);
    } finally {
      setScanning(false);
    }
  }

  async function handleDeploy() {
    setDeploying(true);
    setDeployResult(undefined);
    try {
      const res = await fetch("/api/admin/deploy", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "deploy failed");
      setDeployResult(
        `✅ Déployé ${data.updatedCount} photos. ${data.deployUrl ?? "Live sur airplanestore.fr"}`,
      );
    } catch (e) {
      setDeployResult(`❌ ${(e as Error).message}`);
    } finally {
      setDeploying(false);
    }
  }

  const approvedCount = useMemo(() => {
    let n = 0;
    Object.values(state).forEach((row) => {
      Object.values(row.views ?? {}).forEach((v) => v?.approved && n++);
    });
    return n;
  }, [state]);

  const problematicCount = useMemo(
    () => Object.values(state).filter((s) => s.problematic).length,
    [state],
  );

  return (
    <div>
      {/* Folder picker */}
      <div
        className="mb-6 p-5 rounded-2xl"
        style={{
          background: "linear-gradient(145deg, #0c0c18, #07070f)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p
          className="font-mono text-[0.62rem] tracking-[0.22em] uppercase mb-3"
          style={{ color: "rgba(58,142,255,0.7)" }}
        >
          📁 Dossier source (optionnel)
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="~/Downloads ou /Users/mac/Pictures/airplanestore"
            disabled={disabled}
            className="flex-1 min-w-[280px] px-4 py-2.5 rounded-xl font-mono text-[0.85rem] outline-none"
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.9)",
            }}
          />
          <button
            onClick={handleScan}
            disabled={disabled || scanning}
            className="font-semibold text-[0.85rem] px-5 py-2.5 rounded-xl disabled:opacity-40 transition"
            style={{ background: "linear-gradient(135deg, #3a8eff, #1a4aff)", color: "#fff" }}
          >
            {scanning ? "⏳" : "🔍 Scanner"}
          </button>
          {scanned && (
            <span className="text-[0.85rem] text-white/55">
              {scanned.length} fichiers
            </span>
          )}
          <span className="text-[0.78rem] text-white/40 ml-auto">
            💡 Tu peux aussi cliquer <b>♻️ Améliorer photo actuelle</b> sans rien scanner.
          </span>
        </div>
        {scanError && (
          <p className="mt-3 text-[0.85rem] text-red-400">⚠️ {scanError}</p>
        )}
      </div>

      {/* Category + problematic filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          Tout ({products.length})
        </FilterChip>
        {collections.map((c) => {
          const n = products.filter((p) => p.collection === c).length;
          return (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {COLLECTION_LABEL[c] ?? c} ({n})
            </FilterChip>
          );
        })}
        {problematicCount > 0 && (
          <FilterChip
            active={filter === "problematic"}
            onClick={() => setFilter("problematic")}
            variant="warning"
          >
            ⚠️ À redemander ({problematicCount})
          </FilterChip>
        )}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-6">
        {filtered.map((p) => (
          <ProductRowCard
            key={p.handle}
            product={p}
            rowState={state[p.handle] ?? {}}
            scanned={scanned}
            disabled={disabled}
            onUpdate={(patch) => updateRow(p.handle, patch)}
            onUpdateView={(view, patch) => updateView(p.handle, view, patch)}
          />
        ))}
      </div>

      {/* Sticky deploy footer */}
      {(approvedCount > 0 || deployResult) && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-[95vw]"
          style={{
            background: "linear-gradient(135deg, #0d1f10, #0a1a0d)",
            border: "1px solid rgba(34,197,94,0.4)",
            backdropFilter: "blur(12px)",
            zIndex: 50,
          }}
        >
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-emerald-400 mb-1">
              {approvedCount} photo{approvedCount > 1 ? "s" : ""} validée{approvedCount > 1 ? "s" : ""}
            </p>
            {deployResult ? (
              <p className="text-[0.78rem] text-white/75 max-w-md break-all">{deployResult}</p>
            ) : (
              <p className="text-[0.78rem] text-white/65">Prêtes à publier en prod.</p>
            )}
          </div>
          {approvedCount > 0 && (
            <button
              onClick={handleDeploy}
              disabled={disabled || deploying}
              className="font-bold text-[0.85rem] px-5 py-2.5 rounded-full disabled:opacity-40 transition"
              style={{
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                color: "#06060f",
              }}
            >
              {deploying ? "🚀 Déploiement…" : "🚀 Déployer en prod"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  variant = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "warning";
}) {
  const colors =
    variant === "warning"
      ? {
          bgActive: "rgba(255,170,50,0.18)",
          borderActive: "rgba(255,180,80,0.55)",
          textActive: "#ffd28a",
        }
      : {
          bgActive: "rgba(58,142,255,0.18)",
          borderActive: "rgba(120,180,255,0.55)",
          textActive: "#fff",
        };
  return (
    <button
      onClick={onClick}
      className="font-mono text-[0.7rem] tracking-[0.18em] uppercase transition-all px-4 py-2 rounded-full"
      style={{
        background: active ? colors.bgActive : "rgba(255,255,255,0.04)",
        border: active ? `1px solid ${colors.borderActive}` : "1px solid rgba(255,255,255,0.08)",
        color: active ? colors.textActive : "rgba(255,255,255,0.55)",
      }}
    >
      {children}
    </button>
  );
}

function ProductRowCard({
  product,
  rowState,
  scanned,
  disabled,
  onUpdate,
  onUpdateView,
}: {
  product: ProductRow;
  rowState: RowState;
  scanned: FolderFile[] | null;
  disabled: boolean;
  onUpdate: (patch: Partial<RowState>) => void;
  onUpdateView: (view: ViewKey, patch: Partial<ViewState>) => void;
}) {
  async function processOne(view: ViewKey, opts: { useCurrent?: boolean } = {}) {
    if (!opts.useCurrent && !rowState.sourcePath) return;
    onUpdateView(view, { processing: true, error: undefined });
    try {
      const res = await fetch("/api/admin/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: product.handle,
          view,
          ...(opts.useCurrent
            ? { useCurrent: true }
            : { sourcePath: rowState.sourcePath }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "process failed");
      onUpdateView(view, {
        processing: false,
        version: (rowState.views?.[view]?.version ?? 0) + 1,
      });
    } catch (e) {
      onUpdateView(view, { processing: false, error: (e as Error).message });
    }
  }

  async function generateGallery(opts: { useCurrent?: boolean } = {}) {
    // Launch all 6 views in parallel — each updates its own preview as
    // soon as it lands so the operator sees progress incrementally.
    await Promise.all(VIEWS.map(({ key }) => processOne(key, opts)));
  }

  async function handleApprove(view: ViewKey) {
    try {
      const previewSlug = view === "profile" ? product.handle : `${product.handle}--${view}`;
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: product.handle, previewSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "approve failed");
      onUpdateView(view, { approved: true });
    } catch (e) {
      onUpdateView(view, { error: (e as Error).message });
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
    } catch {
      // Best-effort — UI state stays in sync.
    }
  }

  const filename = rowState.sourcePath?.split("/").pop();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0c0c18, #07070f)",
        border: rowState.problematic
          ? "1px solid rgba(255,170,50,0.55)"
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
            {rowState.problematic ? "⚠️ À redemander" : "🏷️ Marquer problématique"}
          </button>
        </div>
      </div>

      {/* Actuel + sélecteur source */}
      <div className="px-5 pb-5 grid md:grid-cols-[260px_1fr] gap-5">
        <div>
          <ImagePane label="ACTUEL" src={product.currentImage} />
          {/* Source picker / file feedback */}
          <select
            value={rowState.sourcePath ?? ""}
            onChange={(e) => onUpdate({ sourcePath: e.target.value || undefined })}
            disabled={disabled || !scanned}
            className="mt-3 w-full px-3 py-2 rounded-lg font-mono text-[0.72rem] outline-none disabled:opacity-40"
            style={{
              background: rowState.sourcePath
                ? "rgba(34,197,94,0.08)"
                : "rgba(0,0,0,0.3)",
              border: rowState.sourcePath
                ? "1px solid rgba(34,197,94,0.35)"
                : "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <option value="">
              {scanned ? "— Photo source (optionnel) —" : "Scanne un dossier pour choisir une source"}
            </option>
            {scanned?.map((f) => (
              <option key={f.path} value={f.path}>
                {f.name}
              </option>
            ))}
          </select>
          {filename && (
            <p className="mt-1.5 text-[0.7rem] text-white/45 font-mono truncate">
              📄 {filename}
            </p>
          )}

          {/* Generate gallery buttons */}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => generateGallery({ useCurrent: true })}
              disabled={disabled}
              className="w-full text-[0.78rem] font-semibold px-4 py-2.5 rounded-lg disabled:opacity-40 transition"
              style={{
                background: "rgba(255,180,77,0.16)",
                border: "1px solid rgba(255,180,77,0.4)",
                color: "rgba(255,210,160,1)",
              }}
            >
              ♻️ Galerie 6 vues (photo actuelle)
            </button>
            <button
              onClick={() => generateGallery()}
              disabled={disabled || !rowState.sourcePath}
              className="w-full text-[0.78rem] font-semibold px-4 py-2.5 rounded-lg disabled:opacity-40 transition"
              style={{
                background: "rgba(58,142,255,0.18)",
                border: "1px solid rgba(120,180,255,0.4)",
              }}
            >
              ✨ Galerie 6 vues (fichier choisi)
            </button>
          </div>
        </div>

        {/* 6-view gallery preview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VIEWS.map(({ key, label }) => {
            const vstate = rowState.views?.[key] ?? {};
            const previewSlug =
              key === "profile" ? product.handle : `${product.handle}--${key}`;
            return (
              <ViewTile
                key={key}
                label={label}
                src={
                  vstate.version
                    ? `/api/admin/preview/${previewSlug}?v=${vstate.version}`
                    : null
                }
                processing={!!vstate.processing}
                approved={!!vstate.approved}
                error={vstate.error}
                onApprove={() => handleApprove(key)}
                onRegenerate={() =>
                  processOne(key, {
                    useCurrent: !rowState.sourcePath,
                  })
                }
                disabled={disabled}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ImagePane({ label, src }: { label: string; src: string | null }) {
  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{
        background: "#080810",
        border: "1px solid rgba(255,255,255,0.04)",
        aspectRatio: "1/1",
      }}
    >
      <span
        className="absolute top-2 left-2 z-10 font-mono text-[0.55rem] tracking-[0.18em] uppercase px-2 py-0.5 rounded"
        style={{
          background: "rgba(8,8,16,0.85)",
          color: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(8px)",
        }}
      >
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
        <div className="w-full h-full flex items-center justify-center text-white/25 text-[0.75rem]">
          —
        </div>
      )}
    </div>
  );
}

function ViewTile({
  label,
  src,
  processing,
  approved,
  error,
  onApprove,
  onRegenerate,
  disabled,
}: {
  label: string;
  src: string | null;
  processing: boolean;
  approved: boolean;
  error?: string;
  onApprove: () => void;
  onRegenerate: () => void;
  disabled: boolean;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden relative flex flex-col"
      style={{
        background: "#080810",
        border: approved
          ? "1px solid rgba(34,197,94,0.55)"
          : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="relative" style={{ aspectRatio: "1/1" }}>
        <span
          className="absolute top-2 left-2 z-10 font-mono text-[0.55rem] tracking-[0.18em] uppercase px-2 py-0.5 rounded"
          style={{
            background: "rgba(8,8,16,0.85)",
            color: approved ? "#7df09f" : "rgba(255,255,255,0.55)",
            backdropFilter: "blur(8px)",
          }}
        >
          {approved && "✓ "}
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
            onClick={onApprove}
            disabled={disabled || approved}
            className="flex-1 text-[0.7rem] font-bold py-1.5 rounded-md disabled:opacity-40 transition"
            style={{
              background: approved
                ? "rgba(34,197,94,0.15)"
                : "linear-gradient(135deg, #4ade80, #22c55e)",
              color: approved ? "#7df09f" : "#06060f",
            }}
          >
            {approved ? "✓ Validée" : "✅ Valider"}
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
