import Link from "next/link";
import { COLLECTIONS, type Collection } from "@/lib/products";
import { getProductsAdmin } from "@/lib/products-store";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const products = await getProductsAdmin();

  // Group by collection for a cleaner overview.
  const grouped: Record<Collection, typeof products> = {} as never;
  for (const c of COLLECTIONS) grouped[c.slug] = [];
  for (const p of products) (grouped[p.collection] ??= []).push(p);

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
          marginBottom: "2.4rem",
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
        <LogoutButton />
      </header>

      {/* Grouped product lists */}
      {COLLECTIONS.map((c) => {
        const list = grouped[c.slug] ?? [];
        if (list.length === 0) return null;
        return (
          <section key={c.slug} style={{ marginBottom: "2rem" }}>
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
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {list.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/${p.handle}`}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: 14,
                    borderRadius: 14,
                    background: "linear-gradient(160deg,#0d0d1a 0%,#0a0a14 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    textDecoration: "none",
                    color: "#fff",
                    transition: "border-color 0.18s, transform 0.18s",
                  }}
                >
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

                  {/* Status chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
                    {p.hidden && <Chip color="#ff7a7a">Masqué</Chip>}
                    {!p.inStock && !p.comingSoon && <Chip color="#888">Épuisé</Chip>}
                    {p.comingSoon && <Chip color="#a78bfa">Bientôt</Chip>}
                    {p.bestseller && <Chip color="#e8c048">★ Bestseller</Chip>}
                    {p.inStock && !p.hidden && !p.bestseller && !p.comingSoon && (
                      <Chip color="#3a8eff">En vente</Chip>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
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
