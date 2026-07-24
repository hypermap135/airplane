import Link from "next/link";
import { COLLECTIONS, type Collection } from "@/lib/products";
import { getProductsAdmin } from "@/lib/products-store";
import { getInventorySnapshot } from "@/lib/shopify-admin-inventory";
import { DISCOUNT_CODE } from "@/lib/shopify";
import LogoutButton from "./LogoutButton";
import CopyPill from "./CopyPill";
import SyncPricesButton from "./SyncPricesButton";
import CatalogueFilter from "./CatalogueFilter";

export const dynamic = "force-dynamic";

const SHOPIFY_PUBLIC_DOMAIN =
  process.env.SHOPIFY_PUBLIC_DOMAIN ??
  process.env.SHOPIFY_STORE_DOMAIN ??
  "y823wg-nz.myshopify.com";

export default async function AdminHome() {
  const [products, inventory] = await Promise.all([
    getProductsAdmin(),
    getInventorySnapshot(),
  ]);

  // Group by collection for a cleaner overview.
  const grouped: Record<Collection, typeof products> = {} as never;
  for (const c of COLLECTIONS) grouped[c.slug] = [];
  for (const p of products) (grouped[p.collection] ??= []).push(p);

  // Global counters shown in the header for quick health-checks.
  // Only count a product as "broken" once we have live Shopify data — if the
  // inventory fetch itself failed (empty map), we don't want to flag every
  // product as broken; that would be misleading.
  const inventoryHealthy = Object.keys(inventory.variants).length > 0;
  const brokenPayment = inventoryHealthy
    ? products.filter(
        (p) => !p.variantId || p.variantId === "0" || !inventory.variants[p.variantId],
      )
    : [];
  const lowStock = products.filter((p) => {
    const inv = inventory.variants[p.variantId];
    return (
      inv &&
      typeof inv.quantity === "number" &&
      inv.quantity > 0 &&
      inv.quantity < 5
    );
  });
  const outOfStock = products.filter((p) => {
    const inv = inventory.variants[p.variantId];
    return inv && inv.quantity === 0;
  });

  const fetchedAgo = timeAgo(inventory.fetchedAt);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: "1.4rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(58,142,255,0.7)",
              marginBottom: 6,
            }}
          >
            ✈ AirplaneStore · Admin
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Catalogue
          </h1>
          <p style={{ marginTop: 4, fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>
            {products.length} produits · cliquez sur un produit pour éditer prix,
            description, photos, disponibilité.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <SyncPricesButton />
          <LogoutButton />
        </div>
      </header>

      {/* Health strip */}
      <HealthStrip
        brokenCount={brokenPayment.length}
        outCount={outOfStock.length}
        lowCount={lowStock.length}
        totalCount={products.length}
        hasAdminData={inventory.hasAdminData}
        inventoryHealthy={inventoryHealthy}
        fetchedAgo={fetchedAgo}
      />

      {/* Sticky filter bar : recherche + statut + collection + liens rapides.
          Filtrage 100% client sur les data-attrs des cards ci-dessous. */}
      <CatalogueFilter
        brokenCount={brokenPayment.length}
        outCount={outOfStock.length}
        comingCount={products.filter((p) => p.comingSoon).length}
        hiddenCount={products.filter((p) => p.hidden).length}
        totalCount={products.length}
      />

      {/* Grouped product lists */}
      {COLLECTIONS.map((c) => {
        const list = grouped[c.slug] ?? [];
        if (list.length === 0) return null;
        return (
          <section key={c.slug} data-admin-section style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(58,142,255,0.8)",
                marginBottom: "0.8rem",
              }}
            >
              {c.label} · {list.length}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {list.map((p) => {
                const inv = inventory.variants[p.variantId];
                // "broken" flag only fires when inventory itself is healthy —
                // avoids painting the whole catalogue red if Shopify is down.
                const variantValid =
                  !inventoryHealthy ||
                  Boolean(p.variantId && p.variantId !== "0" && inv);
                const qty = inv?.quantity;
                const paymentLink = variantValid
                  ? `https://${SHOPIFY_PUBLIC_DOMAIN}/cart/${p.variantId}:1?discount=${DISCOUNT_CODE}`
                  : null;
                // Compose status keys pour le filtre client (CSV dans data-status)
                const statusKeys: string[] = [];
                if (!variantValid) statusKeys.push("broken");
                if (p.hidden) statusKeys.push("hidden");
                if (!p.inStock && !p.comingSoon) statusKeys.push("out");
                if (p.comingSoon) statusKeys.push("coming");
                if (variantValid && p.inStock && !p.hidden && !p.comingSoon) statusKeys.push("onsale");
                return (
                  <Link
                    key={p.id}
                    href={`/admin/${p.handle}`}
                    data-admin-card
                    data-title={p.title}
                    data-handle={p.handle}
                    data-collection={p.collection}
                    data-status={statusKeys.join(",")}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: 14,
                      borderRadius: 14,
                      background: "linear-gradient(160deg,#0d0d1a 0%,#0a0a14 100%)",
                      border: `1px solid ${variantValid ? "rgba(255,255,255,0.06)" : "rgba(255,80,80,0.35)"}`,
                      textDecoration: "none",
                      color: "#fff",
                      transition: "border-color 0.18s, transform 0.18s",
                    }}
                  >
                    {/* Bouton "voir fiche publique" — accessible sans passer par l'éditeur */}
                    <a
                      href={`/products/${p.handle}`}
                      target="_blank"
                      rel="noopener"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Voir la fiche publique de ${p.title}`}
                      title="Voir la fiche publique dans un nouvel onglet"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 8,
                        background: "rgba(58,142,255,0.15)",
                        color: "rgba(58,142,255,0.9)",
                        border: "1px solid rgba(58,142,255,0.35)",
                        fontSize: 14,
                        textDecoration: "none",
                        zIndex: 2,
                      }}
                    >
                      ↗
                    </a>
                    {/* Image preview */}
                    <div
                      style={{
                        aspectRatio: "1/1",
                        borderRadius: 10,
                        background: "#070710",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt={p.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: 12,
                        }}
                      />
                    </div>

                    <div style={{ fontSize: "0.86rem", fontWeight: 700, lineHeight: 1.3 }}>
                      {p.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: "0.66rem",
                        letterSpacing: "0.12em",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      {p.price.toFixed(0)} € · {p.scale ?? "—"}
                    </div>

                    {/* Live stock row — only rendered when we have real data */}
                    {typeof qty === "number" ? (
                      <StockLine qty={qty} />
                    ) : inv ? (
                      <StockLine qty={inv.available ? "in" : "out"} />
                    ) : (
                      <div
                        style={{
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                          fontSize: "0.58rem",
                          letterSpacing: "0.14em",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        stock indisponible
                      </div>
                    )}

                    {/* Status chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
                      {!variantValid && <Chip color="#ff5a5a">⚠ Paiement cassé</Chip>}
                      {p.hidden && <Chip color="#ff7a7a">Masqué</Chip>}
                      {!p.inStock && !p.comingSoon && <Chip color="#888">Épuisé</Chip>}
                      {p.comingSoon && <Chip color="#a78bfa">Bientôt</Chip>}
                      {p.bestseller && <Chip color="#e8c048">★ Bestseller</Chip>}
                      {variantValid &&
                        p.inStock &&
                        !p.hidden &&
                        !p.bestseller &&
                        !p.comingSoon && <Chip color="#3a8eff">En vente</Chip>}
                    </div>

                    {/* Payment link — always visible if we have a valid variant */}
                    {paymentLink && (
                      <CopyPill
                        label="Lien paiement direct"
                        value={paymentLink}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}

/* ── UI helpers ─────────────────────────────────────────────── */

function HealthStrip({
  brokenCount,
  outCount,
  lowCount,
  totalCount,
  hasAdminData,
  inventoryHealthy,
  fetchedAgo,
}: {
  brokenCount: number;
  outCount: number;
  lowCount: number;
  totalCount: number;
  hasAdminData: boolean;
  inventoryHealthy: boolean;
  fetchedAgo: string;
}) {
  return (
    <section
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        padding: "10px 14px",
        borderRadius: 12,
        background: "linear-gradient(160deg,#0d0d1a 0%,#0a0a14 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        marginBottom: 24,
        fontSize: "0.72rem",
        color: "rgba(255,255,255,0.65)",
      }}
    >
      {inventoryHealthy ? (
        <BadgePill color={brokenCount > 0 ? "#ff5a5a" : "#3ab879"}>
          {brokenCount > 0
            ? `⚠ ${brokenCount} produit${brokenCount > 1 ? "s" : ""} sans lien de paiement`
            : "✓ Tous les liens de paiement OK"}
        </BadgePill>
      ) : (
        <BadgePill color="#e8c048">
          ⚠ Inventaire Shopify injoignable — statuts indéterminés
        </BadgePill>
      )}
      {outCount > 0 && (
        <BadgePill color="#888">
          {outCount} en rupture
        </BadgePill>
      )}
      {lowCount > 0 && (
        <BadgePill color="#e8c048">
          {lowCount} stock bas (&lt; 5)
        </BadgePill>
      )}
      <BadgePill color="rgba(255,255,255,0.35)">{totalCount} au total</BadgePill>
      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.14em",
            color: hasAdminData ? "#7be5b5" : "#e8c048",
          }}
          title={hasAdminData
            ? "SHOPIFY_ADMIN_TOKEN présent — quantités précises"
            : "SHOPIFY_ADMIN_TOKEN manquant — seuls les statuts en vente/épuisé sont fiables"}
        >
          {hasAdminData ? "● stock temps réel" : "● stock partiel"}
        </span>
        <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)" }}>
          maj {fetchedAgo}
        </span>
      </div>
    </section>
  );
}

function StockLine({ qty }: { qty: number | "in" | "out" }) {
  if (qty === "in") {
    return <PillLine color="#3ab879" text="● En stock" />;
  }
  if (qty === "out") {
    return <PillLine color="#888" text="○ Épuisé" />;
  }
  const color = qty === 0 ? "#888" : qty < 5 ? "#e8c048" : "#3ab879";
  const dot = qty === 0 ? "○" : "●";
  const text = qty === 0 ? "Épuisé" : `${qty} en stock`;
  return <PillLine color={color} text={`${dot} ${text}`} />;
}

function PillLine({ color, text }: { color: string; text: string }) {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.62rem",
        letterSpacing: "0.14em",
        color,
      }}
    >
      {text}
    </div>
  );
}

function BadgePill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "5px 10px",
        borderRadius: 999,
        background: `${color}20`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {children}
    </span>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.55rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        padding: "3px 7px",
        borderRadius: 999,
        background: `${color}26`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {children}
    </span>
  );
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `il y a ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  return `il y a ${h} h`;
}
