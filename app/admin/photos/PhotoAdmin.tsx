"use client";

import { useState, useMemo, useEffect } from "react";

type ProductRow = {
  handle: string;
  title: string;
  collection: string;
  currentImage: string;
  inStock: boolean;
};

type RowState = {
  sourcePath?: string;     // chosen file path from the scanned folder
  processing?: boolean;
  previewVersion?: number; // bumped after each pipeline run to bust img cache
  approved?: boolean;
  error?: string;
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

/** Score a filename's affinity with a product (used for auto-suggestion). */
function matchScore(filename: string, product: ProductRow): number {
  const fn = filename.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const handle = product.handle.toLowerCase().replace(/-/g, " ");
  const title = product.title.toLowerCase().replace(/[^a-z0-9]+/g, " ");

  let score = 0;
  if (fn.includes(handle)) score += 100;
  const titleWords = title.split(" ").filter((w) => w.length > 2);
  titleWords.forEach((w) => {
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

  // Persist last-used folder
  useEffect(() => {
    const saved = localStorage.getItem(FOLDER_KEY);
    if (saved) setFolder(saved);
  }, []);

  const collections = useMemo(() => {
    const cs = new Set<string>();
    products.forEach((p) => cs.add(p.collection));
    return Array.from(cs);
  }, [products]);

  const filtered = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) => p.collection === filter);
  }, [products, filter]);

  const updateRow = (handle: string, patch: Partial<RowState>) =>
    setState((s) => ({ ...s, [handle]: { ...s[handle], ...patch } }));

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

      // Auto-suggest the best file for each product (only if not already chosen)
      const auto: Record<string, RowState> = {};
      products.forEach((p) => {
        if (state[p.handle]?.sourcePath) return;
        const ranked = data.files
          .map((f: FolderFile) => ({ f, score: matchScore(f.name, p) }))
          .filter((x: { score: number }) => x.score > 0)
          .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
        if (ranked.length > 0) auto[p.handle] = { sourcePath: ranked[0].f.path };
      });
      setState((s) => ({ ...auto, ...s, ...auto }));
    } catch (e) {
      setScanError((e as Error).message);
    } finally {
      setScanning(false);
    }
  }

  const totalChosen = Object.values(state).filter((s) => s.sourcePath).length;

  return (
    <div>
      {/* Folder picker */}
      <div
        className="mb-8 p-5 rounded-2xl"
        style={{
          background: "linear-gradient(145deg, #0c0c18, #07070f)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p
          className="font-mono text-[0.62rem] tracking-[0.22em] uppercase mb-3"
          style={{ color: "rgba(58,142,255,0.7)" }}
        >
          📁 Dossier source des photos
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
            style={{
              background: "linear-gradient(135deg, #3a8eff, #1a4aff)",
              color: "#fff",
            }}
          >
            {scanning ? "⏳ Scan…" : "🔍 Scanner le dossier"}
          </button>
          {scanned && (
            <span className="text-[0.85rem] text-white/55">
              {scanned.length} photos trouvées · {totalChosen}/{products.length}{" "}
              produits matchés
            </span>
          )}
        </div>
        {scanError && (
          <p className="mt-3 text-[0.85rem] text-red-400">⚠️ {scanError}</p>
        )}
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          Tout ({products.length})
        </FilterChip>
        {collections.map((c) => {
          const n = products.filter((p) => p.collection === c).length;
          return (
            <FilterChip
              key={c}
              active={filter === c}
              onClick={() => setFilter(c)}
            >
              {COLLECTION_LABEL[c] ?? c} ({n})
            </FilterChip>
          );
        })}
      </div>

      {/* Grid of product rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((p) => (
          <ProductRowCard
            key={p.handle}
            product={p}
            rowState={state[p.handle] ?? {}}
            scanned={scanned}
            disabled={disabled}
            onUpdate={(patch) => updateRow(p.handle, patch)}
          />
        ))}
      </div>

      <ApprovedSummary state={state} products={products} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[0.7rem] tracking-[0.18em] uppercase transition-all px-4 py-2 rounded-full"
      style={{
        background: active ? "rgba(58,142,255,0.18)" : "rgba(255,255,255,0.04)",
        border: active
          ? "1px solid rgba(120,180,255,0.55)"
          : "1px solid rgba(255,255,255,0.08)",
        color: active ? "#fff" : "rgba(255,255,255,0.55)",
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
}: {
  product: ProductRow;
  rowState: RowState;
  scanned: FolderFile[] | null;
  disabled: boolean;
  onUpdate: (patch: Partial<RowState>) => void;
}) {
  async function handleProcess() {
    if (!rowState.sourcePath) return;
    onUpdate({ processing: true, error: undefined });
    try {
      const res = await fetch("/api/admin/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: product.handle,
          sourcePath: rowState.sourcePath,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "process failed");
      onUpdate({
        processing: false,
        previewVersion: (rowState.previewVersion ?? 0) + 1,
      });
    } catch (e) {
      onUpdate({ processing: false, error: (e as Error).message });
    }
  }

  async function handleApprove() {
    onUpdate({ error: undefined });
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: product.handle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "approve failed");
      onUpdate({ approved: true });
    } catch (e) {
      onUpdate({ error: (e as Error).message });
    }
  }

  const filename = rowState.sourcePath?.split("/").pop();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0c0c18, #07070f)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
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
          <h3 className="font-bold text-[0.95rem]">{product.title}</h3>
          <p className="font-mono text-[0.6rem] text-white/30 mt-0.5">
            {product.handle}
          </p>
        </div>
        {rowState.approved && (
          <span
            className="font-mono text-[0.6rem] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(34,197,94,0.15)",
              color: "#7df09f",
              border: "1px solid rgba(34,197,94,0.35)",
            }}
          >
            ✓ Validé
          </span>
        )}
      </div>

      {/* Before / After side-by-side */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <ImagePane label="ACTUEL" src={product.currentImage} />
        <ImagePane
          label="NOUVEAU (preview)"
          src={
            rowState.previewVersion
              ? `/api/admin/preview/${product.handle}?v=${rowState.previewVersion}`
              : null
          }
        />
      </div>

      {/* Controls */}
      <div className="px-5 pb-5 space-y-3">
        {/* Source file picker — dropdown of scanned files */}
        <select
          value={rowState.sourcePath ?? ""}
          onChange={(e) => onUpdate({ sourcePath: e.target.value || undefined })}
          disabled={disabled || !scanned}
          className="w-full px-3 py-2 rounded-lg font-mono text-[0.78rem] outline-none disabled:opacity-40 transition"
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
            {scanned
              ? "— Choisir une photo dans le dossier —"
              : "Scanne d'abord un dossier ↑"}
          </option>
          {scanned?.map((f) => (
            <option key={f.path} value={f.path}>
              {f.name}
            </option>
          ))}
        </select>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleProcess}
            disabled={disabled || !rowState.sourcePath || rowState.processing}
            className="text-[0.78rem] font-semibold px-4 py-2 rounded-full disabled:opacity-40 transition"
            style={{
              background: "rgba(58,142,255,0.18)",
              border: "1px solid rgba(120,180,255,0.4)",
            }}
          >
            {rowState.processing ? "⚙️ Pipeline…" : "✨ Lancer pipeline"}
          </button>
          <button
            onClick={handleApprove}
            disabled={disabled || !rowState.previewVersion || rowState.approved}
            className="text-[0.78rem] font-bold px-4 py-2 rounded-full disabled:opacity-40 transition"
            style={{
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              color: "#06060f",
            }}
          >
            {rowState.approved ? "✓ Validé" : "✅ Valider"}
          </button>
        </div>

        {filename && (
          <p className="text-[0.72rem] text-white/45 font-mono truncate">
            📄 {filename}
          </p>
        )}
        {rowState.error && (
          <p className="text-[0.78rem] text-red-400">⚠️ {rowState.error}</p>
        )}
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

function ApprovedSummary({
  state,
  products,
}: {
  state: Record<string, RowState>;
  products: ProductRow[];
}) {
  const approved = products.filter((p) => state[p.handle]?.approved);
  if (approved.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #0d1f10, #0a1a0d)",
        border: "1px solid rgba(34,197,94,0.4)",
        backdropFilter: "blur(12px)",
      }}
    >
      <p className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-emerald-400 mb-1">
        {approved.length} photo{approved.length > 1 ? "s" : ""} validée
        {approved.length > 1 ? "s" : ""}
      </p>
      <p className="text-[0.78rem] text-white/65">
        Reviens sur Claude — il met à jour products.ts et déploie en batch.
      </p>
    </div>
  );
}
