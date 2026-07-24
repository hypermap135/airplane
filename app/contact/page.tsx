"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || message.trim().length < 5) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: "contact-page",
          name, subject, message,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ── Compact hero ── */}
      <div className="bg-brand-light border-b border-ink-line">
        <div className="mx-auto max-w-3xl px-4 md:px-8 py-10 md:py-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-dark mb-2">
            Contact
          </div>
          <h1 className="h-display text-3xl md:text-4xl">Parlons de votre projet</h1>
          <p className="mt-3 text-ink-500">
            Une question sur un modèle, un devis entreprise, une gravure ? On
            répond sous 24 h.
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-10 md:py-14">
        {status === "sent" ? (
          <div className="rounded-md border border-status-green/40 bg-[#e8f7ef] p-6 text-ink-900">
            <div className="text-lg font-bold mb-1">✓ Message envoyé</div>
            <p className="text-sm text-ink-700">
              Merci ! Nous vous répondons à <strong>{email}</strong> sous 24 h.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nom" value={name} onChange={setName} type="text" />
              <Field label="Email" value={email} onChange={setEmail} type="email" required />
            </div>
            <Field label="Sujet" value={subject} onChange={setSubject} type="text" />
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-2">Message</label>
              <textarea
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded border border-ink-line bg-white text-ink-900 outline-none focus:border-brand"
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary disabled:opacity-50"
            >
              {status === "sending" ? "Envoi…" : "Envoyer →"}
            </button>
            {status === "error" && (
              <p className="text-status-red text-sm">
                Erreur d'envoi — merci de réessayer ou d'écrire à contact@airplanestore.fr
              </p>
            )}
          </form>
        )}

        <div className="mt-12 text-sm text-ink-500 space-y-1 border-t border-ink-line pt-6">
          <div><strong className="text-ink-900">Email :</strong> contact@airplanestore.fr</div>
          <div>Réponse sous 24 h ouvrées.</div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-900 mb-2">
        {label}{required && <span className="text-status-red"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm rounded border border-ink-line bg-white text-ink-900 outline-none focus:border-brand"
      />
    </div>
  );
}
