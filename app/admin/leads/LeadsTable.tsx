"use client";

import { useState, useTransition } from "react";
import type { Lead } from "@/lib/leads-store";

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}j`;
}

export default function LeadsTable({ initial }: { initial: Lead[] }) {
  const [leads, setLeads] = useState(initial);
  const [busy, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function sendManual(email: string, kind: "j1" | "j3") {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kind }),
      });
      const j = await res.json().catch(() => ({}));
      if (j.dryRun) {
        setMsg(`⚠ Envoi simulé (Brevo pas configuré) — email ${email}`);
      } else if (j.ok) {
        setMsg(`✓ Rappel ${kind.toUpperCase()} envoyé à ${email}`);
        // Update local state to reflect sent
        setLeads(leads.map((l) => l.email === email ? { ...l, sent: { ...(l.sent ?? {}), [kind]: Date.now() } } : l));
      } else {
        setMsg(`✕ Échec : ${j.error ?? "unknown"}`);
      }
    });
  }

  if (leads.length === 0) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
        Aucun lead pour l'instant. Les emails captés au panier apparaîtront ici.
      </div>
    );
  }

  return (
    <div>
      {msg && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 10,
          marginBottom: 14,
          background: "rgba(58,142,255,0.1)",
          border: "1px solid rgba(58,142,255,0.4)",
          color: "#7bbaff",
          fontSize: "0.82rem",
        }}>{msg}</div>
      )}

      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "#0a0a14", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", fontSize: "0.62rem", letterSpacing: "0.14em" }}>
              <th style={cellHead}>Email</th>
              <th style={cellHead}>Source</th>
              <th style={cellHead}>Panier</th>
              <th style={cellHead}>Capté</th>
              <th style={cellHead}>J+1</th>
              <th style={cellHead}>J+3</th>
              <th style={cellHead}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.email} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0d0d1a" }}>
                <td style={cell}>{l.email}</td>
                <td style={{ ...cell, color: "rgba(255,255,255,0.55)" }}>{l.source}</td>
                <td style={cell}>
                  {l.cartValue ? `${l.cartValue.toFixed(2)}€` : "—"}
                  {l.cartItems && (
                    <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                      {l.cartItems.length} article{l.cartItems.length > 1 ? "s" : ""}
                    </div>
                  )}
                </td>
                <td style={{ ...cell, color: "rgba(255,255,255,0.55)" }}>il y a {timeAgo(l.createdAt)}</td>
                <td style={cell}>
                  {l.sent?.j1
                    ? <span style={{ color: "#7be5b5" }}>✓ envoyé</span>
                    : <span style={{ color: "rgba(255,255,255,0.4)" }}>—</span>}
                </td>
                <td style={cell}>
                  {l.sent?.j3
                    ? <span style={{ color: "#7be5b5" }}>✓ envoyé</span>
                    : <span style={{ color: "rgba(255,255,255,0.4)" }}>—</span>}
                </td>
                <td style={cell}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      disabled={busy || !!l.sent?.j1}
                      onClick={() => sendManual(l.email, "j1")}
                      style={btnSm(!!l.sent?.j1 || busy)}
                      title="Envoyer email J+1 (standard)"
                    >
                      Rappel J+1
                    </button>
                    <button
                      disabled={busy || !!l.sent?.j3}
                      onClick={() => sendManual(l.email, "j3")}
                      style={btnSm(!!l.sent?.j3 || busy, true)}
                      title="Envoyer email J+3 (avec -10%)"
                    >
                      Rappel −10%
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cellHead: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: 600,
};
const cell: React.CSSProperties = {
  padding: "12px",
  color: "#fff",
  verticalAlign: "top",
};
function btnSm(disabled: boolean, gold?: boolean): React.CSSProperties {
  return {
    padding: "6px 10px",
    fontSize: "0.7rem",
    fontWeight: 600,
    borderRadius: 6,
    background: disabled
      ? "rgba(255,255,255,0.05)"
      : gold ? "rgba(240,192,64,0.15)" : "rgba(58,142,255,0.15)",
    border: `1px solid ${disabled ? "rgba(255,255,255,0.08)" : gold ? "rgba(240,192,64,0.45)" : "rgba(58,142,255,0.4)"}`,
    color: disabled ? "rgba(255,255,255,0.3)" : gold ? "#f0c040" : "#3a8eff",
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
  };
}
