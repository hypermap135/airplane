"use client";

import { useState } from "react";

export default function LoginForm({ nextUrl }: { nextUrl: string }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) setError("Mot de passe incorrect.");
        else if (data?.error === "session_secret_missing")
          setError("Configuration manquante côté serveur (ADMIN_SESSION_SECRET).");
        else setError("Connexion impossible.");
        setBusy(false);
        return;
      }
      window.location.href = nextUrl || "/admin";
    } catch {
      setError("Réseau indisponible.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Mot de passe"
        autoFocus
        required
        style={{
          padding: "0.85rem 1rem",
          fontSize: "0.95rem",
          borderRadius: 12,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "#fff",
          outline: "none",
        }}
      />
      {error && (
        <div
          style={{
            fontSize: "0.78rem",
            color: "#ff7a7a",
            padding: "0.5rem 0.75rem",
            background: "rgba(255,80,80,0.08)",
            borderRadius: 8,
            border: "1px solid rgba(255,80,80,0.2)",
          }}
        >
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={busy || !pw}
        style={{
          padding: "0.85rem 1rem",
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
          opacity: busy || !pw ? 0.6 : 1,
        }}
      >
        {busy ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
