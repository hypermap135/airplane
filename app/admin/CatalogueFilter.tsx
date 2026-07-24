"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COLLECTIONS, type Collection } from "@/lib/products";

/**
 * Barre de recherche + filtres statut pour le dashboard admin.
 * Filtrage 100% client-side sur le DOM déjà rendu par le serveur : le
 * layout parent (page.tsx) rend TOUTES les cartes avec des data-attrs, ce
 * composant applique juste display:none aux non-matchs. Pas de re-render,
 * pas de round-trip serveur.
 */

type StatusKey = "all" | "onsale" | "broken" | "out" | "coming" | "hidden";

const STATUS_LABELS: Record<StatusKey, string> = {
  all:    "Tout",
  onsale: "En vente",
  broken: "Paiement cassé",
  out:    "Épuisé",
  coming: "Bientôt",
  hidden: "Masqué",
};

export default function CatalogueFilter({
  brokenCount,
  outCount,
  comingCount,
  hiddenCount,
  totalCount,
}: {
  brokenCount: number;
  outCount: number;
  comingCount: number;
  hiddenCount: number;
  totalCount: number;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusKey>("all");
  const [collection, setCollection] = useState<"all" | Collection>("all");

  // Apply filters to the DOM every time state changes.
  useMemo(() => {
    if (typeof document === "undefined") return;
    const cards = document.querySelectorAll<HTMLElement>("[data-admin-card]");
    const needle = q.trim().toLowerCase();
    let visible = 0;
    cards.forEach((c) => {
      const title = (c.dataset.title || "").toLowerCase();
      const handle = (c.dataset.handle || "").toLowerCase();
      const col = c.dataset.collection || "";
      const st = c.dataset.status || "";

      const matchesQ = needle === "" || title.includes(needle) || handle.includes(needle);
      const matchesStatus = status === "all" || st.split(",").includes(status);
      const matchesCol = collection === "all" || col === collection;
      const show = matchesQ && matchesStatus && matchesCol;
      c.style.display = show ? "" : "none";
      if (show) visible++;
    });
    // Also hide empty section headings
    document.querySelectorAll<HTMLElement>("[data-admin-section]").forEach((sec) => {
      const anyVisible = !!sec.querySelector<HTMLElement>("[data-admin-card]:not([style*='display: none'])");
      sec.style.display = anyVisible ? "" : "none";
    });
    const counter = document.getElementById("admin-filter-count");
    if (counter) counter.textContent = `${visible} / ${totalCount}`;
  }, [q, status, collection, totalCount]);

  return (
    <section
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        margin: "0 -1.5rem 20px",
        padding: "12px 1.5rem",
        background: "rgba(6,6,15,0.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {/* Search */}
        <div style={{ flex: "1 1 240px", position: "relative" }}>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un produit — A380, Concorde, Air France…"
            style={{
              width: "100%",
              padding: "0.7rem 1rem 0.7rem 2.2rem",
              fontSize: "0.85rem",
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#fff",
              outline: "none",
            }}
          />
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
        </div>

        {/* Collection filter */}
        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value as "all" | Collection)}
          style={{
            padding: "0.7rem 0.8rem",
            fontSize: "0.78rem",
            borderRadius: 10,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#fff",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="all" style={{ color: "#000" }}>Toutes collections</option>
          {COLLECTIONS.map((c) => (
            <option key={c.slug} value={c.slug} style={{ color: "#000" }}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Result counter */}
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.55)",
            whiteSpace: "nowrap",
          }}
        >
          <span id="admin-filter-count">{totalCount} / {totalCount}</span>
        </div>
      </div>

      {/* Status chips row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        <StatusChip label={STATUS_LABELS.all} value="all" active={status === "all"} onClick={() => setStatus("all")} />
        <StatusChip label={STATUS_LABELS.onsale} value="onsale" active={status === "onsale"} onClick={() => setStatus("onsale")} />
        {brokenCount > 0 && (
          <StatusChip
            label={`${STATUS_LABELS.broken} · ${brokenCount}`}
            value="broken"
            active={status === "broken"}
            onClick={() => setStatus("broken")}
            color="#ff5a5a"
          />
        )}
        {outCount > 0 && (
          <StatusChip
            label={`${STATUS_LABELS.out} · ${outCount}`}
            value="out"
            active={status === "out"}
            onClick={() => setStatus("out")}
            color="#888"
          />
        )}
        {comingCount > 0 && (
          <StatusChip
            label={`${STATUS_LABELS.coming} · ${comingCount}`}
            value="coming"
            active={status === "coming"}
            onClick={() => setStatus("coming")}
            color="#a78bfa"
          />
        )}
        {hiddenCount > 0 && (
          <StatusChip
            label={`${STATUS_LABELS.hidden} · ${hiddenCount}`}
            value="hidden"
            active={status === "hidden"}
            onClick={() => setStatus("hidden")}
            color="#ff9a5a"
          />
        )}

        {/* Quick links to public site & Shopify admin */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <QuickLink href="https://airplanestore.fr" label="↗ Voir boutique" />
          <QuickLink href="https://admin.shopify.com" label="↗ Admin Shopify" />
        </div>
      </div>
    </section>
  );
}

function StatusChip({
  label,
  active,
  onClick,
  color = "#3a8eff",
}: {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.62rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "6px 12px",
        borderRadius: 999,
        background: active ? `${color}30` : "rgba(255,255,255,0.03)",
        color: active ? color : "rgba(255,255,255,0.55)",
        border: `1px solid ${active ? `${color}70` : "rgba(255,255,255,0.10)"}`,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.62rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "6px 12px",
        borderRadius: 999,
        background: "rgba(58,142,255,0.10)",
        color: "rgba(58,142,255,0.85)",
        border: "1px solid rgba(58,142,255,0.30)",
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Link>
  );
}
