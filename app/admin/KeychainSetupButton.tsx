"use client";

import { useState } from "react";

type Result = {
  ok: boolean;
  created: number;
  skipped: number;
  errors: number;
  results: { handle: string; status: string; variantId?: string; error?: string }[];
  mapping: Record<string, string>;
};

/**
 * One-shot button: creates the 7 missing keychain variants in Shopify
 * and shows the resulting handle → variantId mapping. Copy/paste the
 * JSON back to Claude to wire it into lib/products.ts.
 */
export default function KeychainSetupButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/setup-keychain-variants", {
        method: "POST",
      });
      const data = (await res.json()) as Result;
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result.mapping, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        marginTop: "1.5rem",
        padding: "1.25rem 1.5rem",
        borderRadius: 12,
        border: "1px solid rgba(255,180,77,0.25)",
        background: "linear-gradient(135deg, rgba(255,180,77,0.06) 0%, rgba(255,140,66,0.02) 100%)",
      }}
    >
      <p
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "rgba(255,180,77,0.95)",
          marginBottom: 8,
        }}
      >
        🔑 Setup ponctuel
      </p>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>
        Créer les 7 variantes Shopify des porte-clés
      </h3>
      <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
        Crée 7 produits Shopify à 4,90 € (idempotent — ne duplique pas
        si le handle existe déjà). Une fois cliqué, copiez le mapping
        renvoyé et envoyez-le à Claude pour qu'il l'écrive dans <code>lib/products.ts</code>.
      </p>

      <button
        onClick={onClick}
        disabled={loading}
        style={{
          padding: "0.7rem 1.2rem",
          borderRadius: 999,
          background: loading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#ffb84d 0%,#ff8c42 100%)",
          color: loading ? "rgba(255,255,255,0.5)" : "#1a0e00",
          fontWeight: 700,
          fontSize: "0.82rem",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Création en cours…" : "Créer les variantes →"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: "0.75rem 1rem",
            borderRadius: 8,
            background: "rgba(220,38,38,0.1)",
            border: "1px solid rgba(220,38,38,0.3)",
            color: "rgb(248,113,113)",
            fontSize: "0.8rem",
          }}
        >
          ✗ Erreur : {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>
            ✓ {result.created} créé{result.created > 1 ? "s" : ""}
            {result.skipped > 0 && ` · ${result.skipped} déjà existant${result.skipped > 1 ? "s" : ""}`}
            {result.errors > 0 && ` · ${result.errors} erreur${result.errors > 1 ? "s" : ""}`}
          </p>

          <pre
            style={{
              padding: "1rem",
              borderRadius: 8,
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.85)",
              overflow: "auto",
              maxHeight: 280,
              margin: 0,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {JSON.stringify(result.mapping, null, 2)}
          </pre>

          <button
            onClick={onCopy}
            style={{
              marginTop: 10,
              padding: "0.5rem 1rem",
              borderRadius: 8,
              background: copied ? "rgba(125,240,159,0.15)" : "rgba(255,255,255,0.06)",
              color: copied ? "rgb(125,240,159)" : "rgba(255,255,255,0.8)",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "1px solid " + (copied ? "rgba(125,240,159,0.3)" : "rgba(255,255,255,0.12)"),
              cursor: "pointer",
            }}
          >
            {copied ? "✓ Copié" : "Copier le mapping JSON"}
          </button>

          {result.results.some((r) => r.status === "error") && (
            <details style={{ marginTop: 12, fontSize: "0.78rem", color: "rgba(255,150,150,0.85)" }}>
              <summary style={{ cursor: "pointer" }}>Erreurs détaillées</summary>
              <pre
                style={{
                  marginTop: 8,
                  padding: "0.75rem",
                  fontSize: "0.7rem",
                  background: "rgba(220,38,38,0.08)",
                  borderRadius: 6,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(
                  result.results.filter((r) => r.status === "error"),
                  null,
                  2
                )}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
