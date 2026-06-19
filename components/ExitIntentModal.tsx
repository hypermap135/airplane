"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { trackMeta } from "@/lib/meta";

const STORAGE_KEY = "airplanestore.exit-intent.seen";
const LEAD_STORAGE_KEY = "airplanestore.lead-email";
const DISCOUNT_CODE = "TAKEOFF10";

/**
 * Fires once per session when the cursor leaves via the top edge.
 * The TAKEOFF10 code is gated by email — visitors hand over their
 * address before the code is revealed and copyable. The address lands
 * in /api/lead and the Meta CAPI Lead event fires for ad attribution.
 *
 * Skipped on /admin, the favoris page and product detail routes —
 * those visitors are deeper in the funnel and the popup is pure
 * interruption.
 */
export default function ExitIntentModal() {
  const pathname = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  const skip =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/products/") ||
    pathname === "/favoris";

  // Manual trigger from anywhere in the app (e.g. the announcement
  // bar CTA "Obtenez votre code"). Listened on ALL routes, even where
  // the auto exit-intent is skipped — the user explicitly asked for it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onOpen = () => setOpen(true);
    window.addEventListener("airplane:open-discount", onOpen);
    return () => window.removeEventListener("airplane:open-discount", onOpen);
  }, []);

  useEffect(() => {
    if (skip) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 5) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
      document.removeEventListener("mouseleave", onMouseLeave);
    };

    // Wait a beat — instant top-edge departures usually mean the user
    // is switching tabs, not abandoning.
    const t = setTimeout(() => {
      document.addEventListener("mouseleave", onMouseLeave);
    }, 6_000);

    return () => {
      clearTimeout(t);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [skip, pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Always mount — the auto exit-intent honours `skip`, but the
  // manual trigger (announcement bar CTA) must work on every route,
  // including the ones we skip for auto-fire (PDP, /favoris).
  if (!mounted) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!v.includes("@")) return;
    setSubmitting(true);
    setUnlocked(true);
    localStorage.setItem(LEAD_STORAGE_KEY, v);
    trackMeta("Lead", {
      content_name: "exit-intent-code",
      value: 0,
      currency: "EUR",
    });
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v, source: "exit-intent" }),
      });
    } catch {
      /* don't surface backend errors — the buyer still gets the code */
    }
    setSubmitting(false);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard refused — the code is still readable on screen */
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            background: "rgba(2,2,8,0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden text-center"
            style={{
              borderRadius: 20,
              background: "linear-gradient(160deg,#0c0c1c 0%,#06060f 100%)",
              border: "1px solid rgba(255,180,77,0.30)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.65), 0 0 80px rgba(255,180,77,0.08)",
              padding: "2.5rem 2rem 2rem",
            }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute top-3 right-3 w-8 h-8 grid place-items-center"
              style={{
                borderRadius: 999,
                background: "rgba(8,8,20,0.6)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div
              aria-hidden
              className="text-3xl mx-auto mb-4"
              style={{ filter: "drop-shadow(0 4px 16px rgba(255,180,77,0.4))" }}
            >
              ✈️
            </div>

            {!unlocked ? (
              <>
                <p
                  className="font-mono uppercase mb-3"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.32em",
                    color: "rgba(255,180,77,0.95)",
                  }}
                >
                  Avant de partir
                </p>

                <h2
                  className="font-black text-white mb-2"
                  style={{
                    fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  −10% sur votre première<br/>maquette
                </h2>

                <p
                  className="text-white/65 mb-6 mx-auto"
                  style={{ fontSize: "0.88rem", maxWidth: 340 }}
                >
                  Laissez votre email, on vous envoie le code et la livraison offerte dès 100€ reste cumulable.
                </p>

                <form onSubmit={onSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.fr"
                    autoFocus
                    className="w-full text-center outline-none"
                    style={{
                      background: "rgba(8,8,20,0.6)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      padding: "0.85rem 1.2rem",
                      color: "white",
                      fontSize: "0.9rem",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !email.includes("@")}
                    className="w-full font-semibold transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg,#ffb84d 0%,#ff8c42 100%)",
                      color: "#1a0e00",
                      padding: "0.9rem 1.4rem",
                      borderRadius: 12,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    {submitting ? "Envoi…" : "Recevoir mon code −10%"}
                  </button>
                </form>

                <p
                  className="font-mono uppercase mt-4"
                  style={{
                    fontSize: "0.55rem",
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  Pas de spam · vous pouvez vous désinscrire à tout moment
                </p>
              </>
            ) : (
              <>
                <p
                  className="font-mono uppercase mb-3"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.32em",
                    color: "#7df09f",
                  }}
                >
                  ✓ Code débloqué
                </p>

                <h2
                  className="font-black text-white mb-3"
                  style={{
                    fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  Bienvenue à bord.
                </h2>

                <p
                  className="text-white/65 mb-6 mx-auto"
                  style={{ fontSize: "0.88rem", maxWidth: 340 }}
                >
                  Votre code −10% est ci-dessous. Une copie a été envoyée à <strong className="text-white">{email.trim()}</strong>.
                </p>

                <button
                  onClick={onCopy}
                  className="inline-flex items-center gap-3 mb-4 transition-all hover:scale-[1.02]"
                  style={{
                    padding: "0.95rem 1.8rem",
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#fff 0%,#e8eaf0 100%)",
                    color: "#06060f",
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.4)",
                  }}
                >
                  <span
                    className="font-mono font-black tracking-[0.18em]"
                    style={{ fontSize: "1.05rem" }}
                  >
                    {DISCOUNT_CODE}
                  </span>
                  <span
                    aria-hidden
                    className="font-mono text-[0.62rem] uppercase tracking-[0.22em]"
                    style={{ opacity: copied ? 1 : 0.55, color: copied ? "#10b981" : undefined }}
                  >
                    {copied ? "✓ Copié" : "Cliquer pour copier"}
                  </span>
                </button>

                <div>
                  <button
                    onClick={() => setOpen(false)}
                    className="font-mono uppercase"
                    style={{
                      fontSize: "0.62rem",
                      letterSpacing: "0.22em",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                    }}
                  >
                    Continuer mes achats →
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
