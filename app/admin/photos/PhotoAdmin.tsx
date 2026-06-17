"use client";

import { useState, useMemo, useRef } from "react";

type ProductRow = {
  handle: string;
  title: string;
  collection: string;
  currentImage: string;
  inStock: boolean;
};

type RowState = {
  uploading?: boolean;
  uploadedKb?: number;
  processing?: boolean;
  previewVersion?: number; // bumped to force <img> reload after each process
  processLog?: string;
  approved?: boolean;
  error?: string;
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

  return (
    <div>
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
            disabled={disabled}
            onUpdate={(patch) => updateRow(p.handle, patch)}
          />
        ))}
      </div>

      {/* Approved summary footer */}
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
  disabled,
  onUpdate,
}: {
  product: ProductRow;
  rowState: RowState;
  disabled: boolean;
  onUpdate: (patch: Partial<RowState>) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    onUpdate({ uploading: true, error: undefined });
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("handle", product.handle);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload failed");
      onUpdate({ uploading: false, uploadedKb: data.size_kb });
    } catch (e) {
      onUpdate({ uploading: false, error: (e as Error).message });
    }
  }

  async function handleProcess() {
    onUpdate({ processing: true, error: undefined });
    try {
      const res = await fetch("/api/admin/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: product.handle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "process failed");
      onUpdate({
        processing: false,
        previewVersion: (rowState.previewVersion ?? 0) + 1,
        processLog: data.log,
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
      <div className="px-5 pb-5 flex flex-wrap gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic"
          className="hidden"
          disabled={disabled || rowState.uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
        <button
          onClick={() => fileInput.current?.click()}
          disabled={disabled || rowState.uploading}
          className="text-[0.78rem] font-semibold px-4 py-2 rounded-full disabled:opacity-40 transition"
          style={{
            background: rowState.uploadedKb
              ? "rgba(34,197,94,0.12)"
              : "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {rowState.uploading
            ? "⏳ Upload…"
            : rowState.uploadedKb
              ? `✓ Source (${rowState.uploadedKb} KB)`
              : "📁 Upload photo source"}
        </button>

        <button
          onClick={handleProcess}
          disabled={disabled || !rowState.uploadedKb || rowState.processing}
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

        {rowState.error && (
          <p className="w-full mt-2 text-[0.78rem] text-red-400">
            ⚠️ {rowState.error}
          </p>
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
        Dans le terminal, mets à jour lib/products.ts puis git commit + deploy.
      </p>
    </div>
  );
}
