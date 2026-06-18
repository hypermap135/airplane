"use client";

import { useState, useTransition } from "react";
import type { Product, ProductSpec } from "@/lib/products";

type Props = {
  product: Product;
  hidden: boolean;
  collections: { slug: string; label: string }[];
};

/** Fallback specs shown when the product has no per-product override yet.
 *  Mirrored from components/ProductDetail.tsx so the editor starts with the
 *  same baseline the customer sees, instead of an empty form. */
const DEFAULT_SPECS: ProductSpec[] = [
  { label: "Matière",             value: "Résine monobloc" },
  { label: "Longueur",            value: "~47 cm" },
  { label: "Poids",               value: "~1,3 kg" },
  { label: "Socle",               value: "Bois massif inclus" },
  { label: "Train d'atterrissage",value: "Amovible" },
  { label: "Activation LED",      value: "Tap ou clap · ~20 s" },
  { label: "Batterie",            value: "75 mAh · USB ~1h · auto-off" },
];

/**
 * Full product editor used inside /admin/[handle].
 *
 * Every change is sent as a JSON PATCH to /api/admin/products/[id].
 * Photo upload posts to /api/admin/upload (Vercel Blob) and the returned
 * URL is dropped into the image/images fields.
 */
export default function EditForm({ product, hidden, collections }: Props) {
  const [title, setTitle]           = useState(product.title);
  const [subtitle, setSubtitle]     = useState(product.subtitle ?? "");
  const [price, setPrice]           = useState<string>(String(product.price));
  const [compareAt, setCompareAt]   = useState<string>(
    product.compareAt != null ? String(product.compareAt) : "",
  );
  const [scale, setScale]           = useState(product.scale ?? "");
  const [collection, setCollection] = useState(product.collection);
  const [inStock, setInStock]       = useState(product.inStock);
  const [comingSoon, setComingSoon] = useState(product.comingSoon ?? false);
  const [bestseller, setBestseller] = useState(product.bestseller ?? false);
  const [hide, setHide]             = useState(hidden);
  const [image, setImage]           = useState(product.image);
  const [images, setImages]         = useState<string[]>(product.images ?? []);
  const [specs, setSpecs]           = useState<ProductSpec[]>(
    product.specs && product.specs.length > 0 ? product.specs : DEFAULT_SPECS,
  );
  const [description, setDescription] = useState<string>(product.description ?? "");

  const [busy, startTransition]     = useTransition();
  const [savedMsg, setSavedMsg]     = useState<string | null>(null);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  function buildPatch() {
    const priceNum = Number(price);
    const compareAtNum = compareAt === "" ? null : Number(compareAt);
    // Drop empty rows before sending so the API doesn't store them.
    const cleanSpecs = specs
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label !== "" || s.value !== "");
    return {
      title,
      subtitle,
      description,
      price: Number.isFinite(priceNum) ? priceNum : 0,
      compareAt: compareAtNum,
      scale,
      collection,
      inStock,
      comingSoon,
      bestseller,
      hidden: hide,
      image,
      images,
      specs: cleanSpecs,
    };
  }

  function save() {
    setSavedMsg(null);
    setErrorMsg(null);
    const patch = buildPatch();
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setErrorMsg(j?.error ?? "Erreur d'enregistrement.");
          return;
        }
        setSavedMsg("Enregistré ✓ — visible sur le site dans ~30 s");
      } catch {
        setErrorMsg("Réseau indisponible.");
      }
    });
  }

  async function uploadFile(file: File, folder: string): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErrorMsg(`Upload échoué : ${j?.error ?? res.statusText}`);
      return null;
    }
    const j = await res.json();
    return j.url as string;
  }

  async function onPickMain(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingMain(true);
    const url = await uploadFile(f, `products/${product.id}/main`);
    setUploadingMain(false);
    if (url) setImage(url);
    e.target.value = ""; // allow re-picking the same file
  }

  async function onPickGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadingGallery(true);
    const urls: string[] = [];
    for (const f of files) {
      const url = await uploadFile(f, `products/${product.id}/gallery`);
      if (url) urls.push(url);
    }
    setUploadingGallery(false);
    if (urls.length > 0) setImages([...images, ...urls]);
    e.target.value = "";
  }

  function removeGalleryImage(i: number) {
    setImages(images.filter((_, idx) => idx !== i));
  }

  /* ── Specs helpers ─────────────────────────────────── */
  function updateSpec(i: number, field: "label" | "value", v: string) {
    const next = specs.map((s, idx) => (idx === i ? { ...s, [field]: v } : s));
    setSpecs(next);
  }
  function removeSpec(i: number) {
    setSpecs(specs.filter((_, idx) => idx !== i));
  }
  function addSpec() {
    setSpecs([...specs, { label: "", value: "" }]);
  }
  function moveSpec(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= specs.length) return;
    const next = [...specs];
    [next[i], next[j]] = [next[j], next[i]];
    setSpecs(next);
  }
  function resetSpecsToDefault() {
    setSpecs(DEFAULT_SPECS);
  }

  function moveGallery(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    setImages(next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Quick status banner */}
      {savedMsg && <Banner kind="ok">{savedMsg}</Banner>}
      {errorMsg && <Banner kind="err">{errorMsg}</Banner>}

      {/* ── Main image ── */}
      <Card title="Image principale">
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div
            style={{
              width: 220,
              aspectRatio: "1/1",
              borderRadius: 14,
              background: "#070710",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 10 }}>
            <Label>URL de l&apos;image</Label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              style={inputStyle}
            />
            <label
              style={{
                ...buttonOutline,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: uploadingMain ? "wait" : "pointer",
                opacity: uploadingMain ? 0.6 : 1,
              }}
            >
              {uploadingMain ? "Upload…" : "Choisir une nouvelle photo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic"
                onChange={onPickMain}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      </Card>

      {/* ── Title / subtitle / description ── */}
      <Card title="Titre, sous-titre, description">
        <Label>Titre</Label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <Label style={{ marginTop: 12 }}>Sous-titre (court, affiché sous le titre)</Label>
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          rows={2}
          style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
        />
        <Label style={{ marginTop: 12 }}>
          Description longue (optionnel — affichée sur la fiche produit)
        </Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Histoire de l'avion, détails de la livrée, particularités… (laissez vide pour utiliser la description par défaut)"
          style={{ ...inputStyle, resize: "vertical", minHeight: 110 }}
        />
      </Card>

      {/* ── Price + scale + collection ── */}
      <Card title="Prix et catégorisation">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
          <div>
            <Label>Prix (€)</Label>
            <input
              type="number"
              step="1"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <Label>Prix barré (€) — optionnel</Label>
            <input
              type="number"
              step="1"
              min="0"
              value={compareAt}
              onChange={(e) => setCompareAt(e.target.value)}
              placeholder="(aucun)"
              style={inputStyle}
            />
          </div>
          <div>
            <Label>Échelle</Label>
            <input
              type="text"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              placeholder="1/100"
              style={inputStyle}
            />
          </div>
          <div>
            <Label>Catégorie</Label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value as Product["collection"])}
              style={inputStyle}
            >
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* ── Status flags ── */}
      <Card title="Disponibilité et mise en avant">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          <Toggle checked={inStock} onChange={setInStock} label="En vente" />
          <Toggle checked={comingSoon} onChange={setComingSoon} label="Bientôt disponible" />
          <Toggle checked={bestseller} onChange={setBestseller} label="★ Bestseller" />
          <Toggle checked={hide} onChange={setHide} label="Masquer du site" />
        </div>
        <p style={{ marginTop: 10, fontSize: "0.74rem", color: "rgba(255,255,255,0.45)" }}>
          « Masquer du site » retire le produit de toutes les pages publiques sans
          le supprimer. Pratique pour préparer un produit avant publication.
        </p>
      </Card>

      {/* ── Per-product specs ── */}
      <Card
        title={`Caractéristiques (${specs.length})`}
        action={
          <button
            type="button"
            onClick={resetSpecsToDefault}
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "0.35rem 0.7rem",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            ↺ Recharger les valeurs par défaut
          </button>
        }
      >
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>
          Liste affichée dans le bloc « Caractéristiques » de la fiche produit.
          Vous pouvez modifier le label (matière, longueur, etc.) et la valeur,
          réordonner avec les flèches, supprimer ou ajouter des lignes.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {specs.map((s, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(160px, 30%) 1fr auto",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={s.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
                placeholder="Libellé (ex: Matière)"
                style={inputStyle}
              />
              <input
                type="text"
                value={s.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                placeholder="Valeur (ex: Résine monobloc)"
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 4 }}>
                <MiniBtn onClick={() => moveSpec(i, -1)} disabled={i === 0}>↑</MiniBtn>
                <MiniBtn onClick={() => moveSpec(i, +1)} disabled={i === specs.length - 1}>↓</MiniBtn>
                <MiniBtn onClick={() => removeSpec(i)} danger>✕</MiniBtn>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSpec}
          style={{
            marginTop: 12,
            padding: "0.65rem 1rem",
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            borderRadius: 999,
            background: "rgba(58,142,255,0.12)",
            border: "1px solid rgba(58,142,255,0.4)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          + Ajouter une caractéristique
        </button>
      </Card>

      {/* ── Gallery ── */}
      <Card title={`Galerie (${images.length})`}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              style={{
                position: "relative",
                aspectRatio: "1/1",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#070710",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  padding: 6,
                }}
              >
                <div style={{ display: "flex", gap: 4 }}>
                  <MiniBtn onClick={() => moveGallery(i, -1)} disabled={i === 0}>←</MiniBtn>
                  <MiniBtn onClick={() => moveGallery(i, +1)} disabled={i === images.length - 1}>→</MiniBtn>
                </div>
                <MiniBtn onClick={() => removeGalleryImage(i)} danger>✕</MiniBtn>
              </div>
            </div>
          ))}
        </div>
        <label
          style={{
            ...buttonOutline,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: uploadingGallery ? "wait" : "pointer",
            opacity: uploadingGallery ? 0.6 : 1,
          }}
        >
          {uploadingGallery ? "Upload…" : "Ajouter des photos (galerie)"}
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/heic"
            onChange={onPickGallery}
            style={{ display: "none" }}
          />
        </label>
      </Card>

      {/* ── Save bar (sticky bottom) ── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: 10,
          padding: "14px 16px",
          background: "rgba(6,6,15,0.92)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <button
          onClick={save}
          disabled={busy}
          style={{
            padding: "0.85rem 1.6rem",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            borderRadius: 999,
            color: "#06060f",
            background:
              "linear-gradient(135deg, #d0d4da 0%, #f0f2f5 50%, #ffffff 100%)",
            border: "none",
            cursor: busy ? "wait" : "pointer",
            opacity: busy ? 0.65 : 1,
          }}
        >
          {busy ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}

/* ── Tiny UI helpers ─────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  fontSize: "0.9rem",
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#fff",
  outline: "none",
};

const buttonOutline: React.CSSProperties = {
  padding: "0.7rem 1rem",
  fontSize: "0.78rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  borderRadius: 999,
  background: "rgba(58,142,255,0.12)",
  border: "1px solid rgba(58,142,255,0.4)",
  color: "#fff",
};

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: 18,
        borderRadius: 16,
        background: "linear-gradient(160deg,#0d0d1a 0%,#0a0a14 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(58,142,255,0.8)",
          }}
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.62rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.5)",
        marginBottom: 6,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "0.55rem 0.85rem",
        borderRadius: 999,
        background: checked ? "rgba(58,142,255,0.18)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${checked ? "rgba(58,142,255,0.55)" : "rgba(255,255,255,0.10)"}`,
        cursor: "pointer",
        userSelect: "none",
        fontSize: "0.82rem",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "#3a8eff" }}
      />
      {label}
    </label>
  );
}

function MiniBtn({
  onClick,
  children,
  danger,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 26,
        height: 26,
        fontSize: "0.7rem",
        borderRadius: 6,
        background: danger ? "rgba(255,80,80,0.18)" : "rgba(0,0,0,0.55)",
        border: `1px solid ${danger ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.18)"}`,
        color: "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.3 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Banner({
  kind,
  children,
}: {
  kind: "ok" | "err";
  children: React.ReactNode;
}) {
  const ok = kind === "ok";
  return (
    <div
      style={{
        padding: "0.7rem 1rem",
        borderRadius: 10,
        fontSize: "0.85rem",
        background: ok ? "rgba(60,180,120,0.12)" : "rgba(255,80,80,0.10)",
        border: `1px solid ${ok ? "rgba(60,180,120,0.4)" : "rgba(255,80,80,0.4)"}`,
        color: ok ? "#7be5b5" : "#ff9090",
      }}
    >
      {children}
    </div>
  );
}
