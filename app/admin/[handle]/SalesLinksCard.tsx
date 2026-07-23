"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VariantInventory, InventorySnapshot } from "@/lib/shopify-admin-inventory";

type Props = {
  variantId: string;
  productHandle: string;
  discountCode: string;
  shopifyPublicDomain: string;
  shopifyStoreDomain: string;
};

/**
 * "Ventes & liens" — self-contained client card on the product edit page.
 *
 * Renders three things:
 *  - Live stock (quantity when the admin token gives us one, else in/out)
 *  - Copyable payment link (Shopify cart permalink with TAKEOFF10 applied)
 *  - Copyable "naked" cart link (no discount) + open-in-Shopify-admin
 *
 * Data comes from GET /api/admin/inventory. A "↻ Rafraîchir" button POSTs
 * to the same route with ?force=1 which busts the 60s cache.
 *
 * Never throws: on any fetch/parse failure we render a neutral fallback so
 * the rest of the edit page keeps working.
 */
export default function SalesLinksCard({
  variantId,
  productHandle,
  discountCode,
  shopifyPublicDomain,
  shopifyStoreDomain,
}: Props) {
  const [snapshot, setSnapshot] = useState<InventorySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(async (force = false) => {
    setError(null);
    if (force) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: force ? "POST" : "GET",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as InventorySnapshot;
      if (mounted.current) setSnapshot(data);
    } catch (err) {
      if (mounted.current) setError(String((err as Error)?.message ?? err));
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const inv: VariantInventory | undefined = snapshot?.variants?.[variantId];
  const variantValid = Boolean(variantId && variantId !== "0" && inv);

  const paymentLinkWithDiscount = variantValid
    ? `https://${shopifyPublicDomain}/cart/${variantId}:1?discount=${discountCode}`
    : null;
  const paymentLinkNoDiscount = variantValid
    ? `https://${shopifyPublicDomain}/cart/${variantId}:1`
    : null;
  const publicProductLink = `https://airplanestore.fr/products/${productHandle}`;
  const shopifyAdminLink = inv?.adminProductUrl ?? null;
  const shopifyStoreLink = inv?.productHandle
    ? `https://${shopifyStoreDomain}/products/${inv.productHandle}`
    : null;

  return (
    <section
      style={{
        padding: 18,
        borderRadius: 16,
        background: "linear-gradient(160deg,#0d0d1a 0%,#0a0a14 100%)",
        border: `1px solid ${variantValid ? "rgba(255,255,255,0.06)" : "rgba(255,80,80,0.35)"}`,
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
          Ventes &amp; liens de paiement
        </h2>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "0.35rem 0.7rem",
            borderRadius: 6,
            cursor: refreshing ? "wait" : "pointer",
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          {refreshing ? "…" : "↻ Rafraîchir stock"}
        </button>
      </div>

      {/* ── Variant ID + broken warning ── */}
      {!variantValid && (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(255,80,80,0.10)",
            border: "1px solid rgba(255,80,80,0.4)",
            color: "#ff9090",
            fontSize: "0.82rem",
            lineHeight: 1.4,
          }}
        >
          <strong>⚠ Paiement cassé.</strong>{" "}
          {!variantId || variantId === "0"
            ? "Aucun variantId Shopify n'est associé à ce produit — le bouton \"Ajouter au panier\" du site public ne fait rien."
            : `Le variantId "${variantId}" est absent du catalogue Shopify — il a probablement été supprimé ou renommé. À réassigner.`}
        </div>
      )}

      {/* ── Live stock ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "160px 1fr",
          gap: 10,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Label>Stock live</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {loading && !snapshot ? (
            <Muted>Chargement…</Muted>
          ) : error ? (
            <ErrPill>Erreur : {error}</ErrPill>
          ) : inv ? (
            <>
              {typeof inv.quantity === "number" ? (
                <StockChip qty={inv.quantity} />
              ) : (
                <StockChip qty={inv.available ? "in" : "out"} />
              )}
              {snapshot?.hasAdminData ? null : (
                <Muted title="SHOPIFY_ADMIN_TOKEN manquant — seul l'état vendable est connu, pas la quantité exacte.">
                  quantité indisponible (token admin manquant)
                </Muted>
              )}
              {snapshot?.fetchedAt && (
                <Muted style={{ marginLeft: "auto" }}>
                  maj {new Date(snapshot.fetchedAt).toLocaleTimeString("fr-FR")}
                </Muted>
              )}
            </>
          ) : (
            <Muted>Produit introuvable côté Shopify.</Muted>
          )}
        </div>

        {inv?.sku && (
          <>
            <Label>SKU Shopify</Label>
            <Mono>{inv.sku}</Mono>
          </>
        )}
        {inv?.price && (
          <>
            <Label>Prix Shopify</Label>
            <Mono>{inv.price} €</Mono>
          </>
        )}
        <Label>Variant ID</Label>
        <Mono style={{ color: variantValid ? "#c5daff" : "#ff9090" }}>
          {variantId || "(vide)"}
        </Mono>
      </div>

      {/* ── Link rows ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        {paymentLinkWithDiscount && (
          <LinkRow
            label={`Paiement direct + code ${discountCode}`}
            value={paymentLinkWithDiscount}
            hint="Envoie ce lien à un client, il arrive sur son panier Shopify avec 1 exemplaire et le code de réduction appliqué."
            primary
          />
        )}
        {paymentLinkNoDiscount && (
          <LinkRow
            label="Panier Shopify sans réduction"
            value={paymentLinkNoDiscount}
            hint="Utile si tu veux envoyer le lien à quelqu'un qui n'a pas droit au code TAKEOFF10."
          />
        )}
        <LinkRow
          label="Fiche produit publique"
          value={publicProductLink}
          hint="URL à partager sur les réseaux ou en cold-email."
        />
        {shopifyAdminLink && (
          <ExternalRow
            label="Ouvrir dans Shopify Admin"
            href={shopifyAdminLink}
            hint="Modifier stock, images ou description directement dans Shopify."
          />
        )}
        {shopifyStoreLink && (
          <ExternalRow
            label="Voir sur la boutique Shopify d'origine"
            href={shopifyStoreLink}
            hint="Utile pour vérifier ce que Shopify sert vs. ce qu'AirplaneStore affiche."
          />
        )}
      </div>
    </section>
  );
}

/* ── Tiny UI helpers ─────────────────────────────────── */

function LinkRow({
  label,
  value,
  hint,
  primary,
}: {
  label: string;
  value: string;
  hint?: string;
  primary?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => {});
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        background: primary ? "rgba(58,142,255,0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${primary ? "rgba(58,142,255,0.35)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: primary ? "#c5daff" : "rgba(255,255,255,0.55)",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            fontSize: "0.78rem",
            color: "#fff",
            wordBreak: "break-all",
            textDecoration: "none",
          }}
        >
          {value}
        </a>
        {hint && (
          <div
            style={{
              marginTop: 4,
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.4,
            }}
          >
            {hint}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={copy}
        style={{
          alignSelf: "start",
          padding: "0.5rem 0.9rem",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          borderRadius: 999,
          background: copied ? "rgba(60,180,120,0.2)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${copied ? "rgba(60,180,120,0.5)" : "rgba(255,255,255,0.12)"}`,
          color: copied ? "#7be5b5" : "#fff",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {copied ? "✓ Copié" : "Copier"}
      </button>
    </div>
  );
}

function ExternalRow({
  label,
  href,
  hint,
}: {
  label: string;
  href: string;
  hint?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#fff",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          marginBottom: 4,
        }}
      >
        {label} ↗
      </div>
      {hint && (
        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
          {hint}
        </div>
      )}
    </a>
  );
}

function StockChip({ qty }: { qty: number | "in" | "out" }) {
  let color = "#3ab879";
  let text: string;
  if (qty === "in") text = "● En stock";
  else if (qty === "out") { color = "#888"; text = "○ Épuisé"; }
  else if (qty === 0) { color = "#888"; text = "○ Épuisé"; }
  else if (qty < 5) { color = "#e8c048"; text = `● ${qty} en stock — bas`; }
  else text = `● ${qty} en stock`;
  return (
    <span
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.7rem",
        letterSpacing: "0.14em",
        padding: "5px 10px",
        borderRadius: 999,
        background: `${color}20`,
        border: `1px solid ${color}55`,
        color,
      }}
    >
      {text}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.5)",
      }}
    >
      {children}
    </div>
  );
}

function Mono({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.78rem",
        color: "#c5daff",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function Muted({
  children,
  style,
  title,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  title?: string;
}) {
  return (
    <span
      title={title}
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.62rem",
        letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.4)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function ErrPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.68rem",
        padding: "4px 9px",
        borderRadius: 6,
        background: "rgba(255,80,80,0.12)",
        border: "1px solid rgba(255,80,80,0.4)",
        color: "#ff9090",
      }}
    >
      {children}
    </span>
  );
}
