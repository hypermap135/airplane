"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "airplanestore.exit-intent.seen";
const DISCOUNT_CODE = "TAKEOFF10";

/**
 * Fires once per session: when the cursor leaves the viewport via the
 * top edge (toward URL bar / tabs), show a reminder of the welcome
 * discount. Marked seen in sessionStorage so it doesn't repeat on
 * client-side navigation within the same tab.
 *
 * Skipped on /admin, the cart drawer overlay, and product detail
 * routes — those visitors are deeper in the funnel and the popup is
 * pure interruption.
 */
export default function ExitIntentModal() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  // Skip on admin + product pages.
  const skip =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/products/") ||
    pathname === "/favoris";

  useEffect(() => {
    if (skip) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const onMouseLeave = (e: MouseEvent) => {
      // Only top-edge exits — clientY < 0 means cursor went above viewport.
      if (e.clientY > 5) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
      document.removeEventListener("mouseleave", onMouseLeave);
    };

    // Delay the listener — don't fire if the user immediately leaves
    // the tab (probably switching back, not abandoning).
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

  if (!mounted || skip) return null;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard refused — user can still see + type the code */
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
              Utilisez ce code au panier pour bénéficier de la remise. Cumulable avec la livraison offerte dès 100€.
            </p>

            <button
              onClick={onCopy}
              className="inline-flex items-center gap-3 mb-4 transition-all hover:scale-[1.02]"
              style={{
                padding: "0.85rem 1.6rem",
                borderRadius: 12,
                background: "linear-gradient(135deg,#fff 0%,#e8eaf0 100%)",
                color: "#06060f",
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.4)",
              }}
            >
              <span
                className="font-mono font-black tracking-[0.18em]"
                style={{ fontSize: "1rem" }}
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
                Continuer sans le code
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
