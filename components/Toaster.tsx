"use client";

import { useToasts } from "@/lib/toast";

export default function Toaster() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed z-[60] pointer-events-none"
      style={{ top: 76, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", gap: 8 }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{
            background: t.kind === "error" ? "#c93030" : "var(--ink-900)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            animation: "toastIn 180ms ease-out",
          }}
        >
          <span aria-hidden style={{ color: t.kind === "error" ? "#fff" : "#7CFC9E" }}>
            {t.kind === "error" ? "✕" : "✓"}
          </span>
          {t.message}
        </div>
      ))}
      <style jsx>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
