"use client";

import { useState } from "react";

/**
 * "Sync prix vers Shopify" — client button on /admin.
 *
 * Two-step flow to avoid accidental mass mutations:
 *  1. First click → GET /api/admin/sync-prices → shows the diff
 *  2. Confirm     → POST /api/admin/sync-prices → applies + refreshes
 *
 * If SHOPIFY_ADMIN_TOKEN is missing, the POST comes back with 501 and
 * a clear message telling the user which env var to set.
 */

type PlannedChange = {
  variantId: string;
  handle: string;
  title: string;
  currentShopifyPrice: number | null;
  targetPrice: number;
};

type Report = {
  needsToken: boolean;
  planned: PlannedChange[];
  skippedNoVariant: { handle: string; title: string }[];
  skippedMissing: { handle: string; title: string; variantId: string }[];
  applied?: { variantId: string; ok: boolean; error?: string }[];
  error?: string;
};

export default function SyncPricesButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDryRun = async () => {
    setError(null);
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/admin/sync-prices", { cache: "no-store" });
      const j = (await res.json()) as Report;
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setReport(j);
      setOpen(true);
    } catch (err) {
      setError(String((err as Error)?.message ?? err));
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const runApply = async () => {
    setError(null);
    setConfirming(true);
    try {
      const res = await fetch("/api/admin/sync-prices", {
        method: "POST",
        cache: "no-store",
      });
      const j = (await res.json()) as Report;
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setReport(j);
    } catch (err) {
      setError(String((err as Error)?.message ?? err));
    } finally {
      setConfirming(false);
    }
  };

  const close = () => {
    setOpen(false);
    setReport(null);
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={runDryRun}
        disabled={loading}
        style={{
          padding: "0.55rem 1rem",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "0.62rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          borderRadius: 999,
          background: loading
            ? "rgba(255,255,255,0.05)"
            : "linear-gradient(135deg,#3a8eff 0%,#5aa7ff 100%)",
          border: "1px solid rgba(58,142,255,0.55)",
          color: "#fff",
          cursor: loading ? "wait" : "pointer",
          fontWeight: 700,
        }}
      >
        {loading ? "…" : "⇄ Sync prix vers Shopify"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(760px, 100%)",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: 24,
              borderRadius: 16,
              background: "linear-gradient(160deg,#0d0d1a 0%,#0a0a14 100%)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                Sync des prix Shopify
              </h2>
              <button
                onClick={close}
                aria-label="Fermer"
                style={{
                  padding: "0.3rem 0.7rem",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,80,80,0.10)",
                  border: "1px solid rgba(255,80,80,0.4)",
                  color: "#ff9090",
                  marginBottom: 14,
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {report && (
              <ReportBody
                report={report}
                confirming={confirming}
                onApply={runApply}
                onClose={close}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ReportBody({
  report,
  confirming,
  onApply,
  onClose,
}: {
  report: Report;
  confirming: boolean;
  onApply: () => void;
  onClose: () => void;
}) {
  const wasApplied = Array.isArray(report.applied);
  const successCount = report.applied?.filter((a) => a.ok).length ?? 0;
  const failCount = report.applied?.filter((a) => !a.ok).length ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {report.needsToken && !wasApplied && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(232,192,72,0.10)",
            border: "1px solid rgba(232,192,72,0.4)",
            color: "#f0d574",
            fontSize: "0.82rem",
            lineHeight: 1.5,
          }}
        >
          ⚠ <strong>SHOPIFY_ADMIN_TOKEN</strong> n&apos;est pas configuré. Le dry-run
          te montre ce qui serait mis à jour, mais tu ne pourras pas appliquer.
          Ajoute le token dans les env vars Vercel (Shopify Admin → Apps → develop
          apps → API access token, avec le scope <code>write_products</code>).
        </div>
      )}

      {wasApplied && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background:
              failCount === 0
                ? "rgba(60,180,120,0.10)"
                : "rgba(232,192,72,0.10)",
            border: `1px solid ${failCount === 0 ? "rgba(60,180,120,0.4)" : "rgba(232,192,72,0.4)"}`,
            color: failCount === 0 ? "#7be5b5" : "#f0d574",
            fontSize: "0.86rem",
            lineHeight: 1.5,
          }}
        >
          {failCount === 0
            ? `✓ ${successCount} variant${successCount > 1 ? "s" : ""} mis à jour sur Shopify. Cache invalidé, l'admin va afficher les nouveaux prix dans quelques secondes.`
            : `Mise à jour partielle : ${successCount} OK, ${failCount} en erreur (voir détail ci-dessous).`}
        </div>
      )}

      {/* Planned diff */}
      <section>
        <h3 style={{ ...h3Style, marginBottom: 8 }}>
          {wasApplied ? "Modifications tentées" : "Modifications prévues"} · {report.planned.length}
        </h3>
        {report.planned.length === 0 ? (
          <Empty>Aucune divergence : les prix Shopify correspondent déjà à ceux de products.ts.</Empty>
        ) : (
          <ul style={ulStyle}>
            {report.planned.map((c) => {
              const applied = report.applied?.find((a) => a.variantId === c.variantId);
              const status = applied ? (applied.ok ? "ok" : "err") : "plan";
              return (
                <li key={c.variantId} style={liStyle(status)}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{c.title}</div>
                    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.4)" }}>
                      {c.handle} · variant {c.variantId}
                    </div>
                    {applied?.error && (
                      <div style={{ fontSize: "0.72rem", color: "#ff9090", marginTop: 3 }}>
                        {applied.error}
                      </div>
                    )}
                  </div>
                  <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>
                      {c.currentShopifyPrice != null ? `${c.currentShopifyPrice} €` : "—"}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.35)", margin: "0 8px" }}>→</span>
                    <span style={{ color: status === "err" ? "#ff9090" : "#7be5b5", fontWeight: 700 }}>
                      {c.targetPrice} €
                    </span>
                    {status === "ok" && <span style={{ color: "#7be5b5", marginLeft: 8 }}>✓</span>}
                    {status === "err" && <span style={{ color: "#ff9090", marginLeft: 8 }}>✕</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {report.skippedNoVariant.length > 0 && (
        <section>
          <h3 style={h3Style}>
            Ignorés (aucun variantId Shopify) · {report.skippedNoVariant.length}
          </h3>
          <ul style={{ ...ulStyle, opacity: 0.6 }}>
            {report.skippedNoVariant.map((s) => (
              <li key={s.handle} style={liStyle("skip")}>
                <span>{s.title}</span>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                  {s.handle}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.skippedMissing.length > 0 && (
        <section>
          <h3 style={h3Style}>
            Ignorés (variantId absent du catalogue Shopify) · {report.skippedMissing.length}
          </h3>
          <ul style={{ ...ulStyle, opacity: 0.6 }}>
            {report.skippedMissing.map((s) => (
              <li key={s.handle} style={liStyle("skip")}>
                <div>
                  <div>{s.title}</div>
                  <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.7rem", color: "#ff9090" }}>
                    variant {s.variantId} introuvable
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        {wasApplied ? (
          <button onClick={onClose} style={okBtn}>OK</button>
        ) : (
          <>
            <button onClick={onClose} style={ghostBtn}>Annuler</button>
            <button
              onClick={onApply}
              disabled={confirming || report.planned.length === 0 || report.needsToken}
              style={{
                ...applyBtn,
                opacity: confirming || report.planned.length === 0 || report.needsToken ? 0.5 : 1,
                cursor:
                  confirming || report.planned.length === 0 || report.needsToken
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {confirming
                ? "Envoi…"
                : `Appliquer sur Shopify · ${report.planned.length}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── inline styles ─────────────────────────────────────────── */

const h3Style: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "rgba(58,142,255,0.8)",
  marginBottom: 6,
};

const ulStyle: React.CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

function liStyle(state: "plan" | "ok" | "err" | "skip"): React.CSSProperties {
  const color =
    state === "ok"
      ? "rgba(60,180,120,0.35)"
      : state === "err"
        ? "rgba(255,80,80,0.35)"
        : state === "skip"
          ? "rgba(255,255,255,0.06)"
          : "rgba(58,142,255,0.3)";
  return {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 10,
    background: state === "skip" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${color}`,
    alignItems: "center",
  };
}

const applyBtn: React.CSSProperties = {
  padding: "0.7rem 1.4rem",
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#3a8eff 0%,#5aa7ff 100%)",
  color: "#fff",
};

const okBtn: React.CSSProperties = {
  padding: "0.7rem 1.4rem",
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#d0d4da 0%,#f0f2f5 50%,#ffffff 100%)",
  color: "#06060f",
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  padding: "0.7rem 1.4rem",
  fontSize: "0.78rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  borderRadius: 999,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  cursor: "pointer",
};

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(60,180,120,0.08)",
        border: "1px solid rgba(60,180,120,0.35)",
        color: "#7be5b5",
        fontSize: "0.82rem",
      }}
    >
      {children}
    </div>
  );
}
