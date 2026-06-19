"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/products";
import { trackMeta } from "@/lib/meta";

export default function QuickViewModal({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const { add } = useCart();
  const { setOpen: setCartOpen } = useCartDrawer();

  useEffect(() => setMounted(true), []);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !product) return null;

  const onAdd = () => {
    if (!product.inStock || product.variantId === "0") return;
    add(product.variantId, 1);
    trackMeta("AddToCart", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      contents: [{ id: product.id, quantity: 1, item_price: product.price }],
      currency: "EUR",
      value: product.price,
      num_items: 1,
    });
    onClose();
    setCartOpen(true);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
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
            className="relative w-full max-w-3xl overflow-hidden"
            style={{
              borderRadius: 20,
              background: "linear-gradient(160deg,#0c0c1c 0%,#06060f 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Fermer l'aperçu"
              className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center transition hover:scale-110"
              style={{
                borderRadius: 999,
                background: "rgba(8,8,20,0.75)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative" style={{ aspectRatio: "1/1", background: "#080812" }}>
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  quality={92}
                  className="object-contain"
                  style={{ padding: "8%" }}
                />
                {product.compareAt && (
                  <div
                    className="absolute top-4 left-4 px-2 py-0.5 text-[0.7rem] font-black"
                    style={{ borderRadius: 6, background: "#fff", color: "#010108" }}
                  >
                    −{Math.round(100 - (product.price / product.compareAt) * 100)}%
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6 md:p-8 flex flex-col">
                <p
                  className="font-mono uppercase mb-2"
                  style={{
                    fontSize: "0.58rem",
                    letterSpacing: "0.28em",
                    color: "rgba(58,142,255,0.7)",
                  }}
                >
                  {product.collection}{product.scale ? ` · ${product.scale}` : ""}
                </p>

                <h2
                  className="font-black text-white mb-2 leading-tight"
                  style={{ fontSize: "clamp(1.15rem, 2.4vw, 1.6rem)", letterSpacing: "-0.02em" }}
                >
                  {product.title}
                </h2>

                {product.subtitle && (
                  <p className="text-white/55 text-sm mb-5">{product.subtitle}</p>
                )}

                <div className="flex items-baseline gap-3 mb-5">
                  <span
                    className="font-black text-white"
                    style={{ fontSize: "1.7rem", letterSpacing: "-0.03em" }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAt && (
                    <span
                      className="line-through text-sm"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {formatPrice(product.compareAt)}
                    </span>
                  )}
                </div>

                {/* Quick reassurance row */}
                <ul className="space-y-1.5 mb-6 text-[0.78rem]" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <li className="flex items-center gap-2">
                    <span aria-hidden style={{ color: "#7df09f" }}>✓</span>
                    Livraison estimée 7–15 jours
                  </li>
                  <li className="flex items-center gap-2">
                    <span aria-hidden style={{ color: "#7df09f" }}>✓</span>
                    Retour gratuit sous 30 jours
                  </li>
                  <li className="flex items-center gap-2">
                    <span aria-hidden style={{ color: "#7df09f" }}>✓</span>
                    Paiement sécurisé Stripe
                  </li>
                </ul>

                <div className="mt-auto space-y-2">
                  {product.inStock ? (
                    <button
                      onClick={onAdd}
                      className="w-full font-semibold transition-transform hover:scale-[1.01]"
                      style={{
                        background: "#fff",
                        color: "#06060f",
                        padding: "0.95rem 1.4rem",
                        borderRadius: 999,
                        fontSize: "0.88rem",
                      }}
                    >
                      Ajouter au panier · {formatPrice(product.price)}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full font-semibold opacity-50 cursor-not-allowed"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.5)",
                        padding: "0.95rem 1.4rem",
                        borderRadius: 999,
                        fontSize: "0.88rem",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {product.comingSoon ? "Bientôt disponible" : "Épuisé"}
                    </button>
                  )}

                  <Link
                    href={`/products/${product.handle}`}
                    onClick={onClose}
                    className="block w-full text-center font-semibold text-[0.78rem] transition"
                    style={{
                      padding: "0.7rem 1.2rem",
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    Voir la fiche complète →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
