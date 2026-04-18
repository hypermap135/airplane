"use client";

import { useState } from "react";

export type FAQItem = { q: string; a: string };

const DEFAULT_ITEMS: FAQItem[] = [
  {
    q: "Quels sont les délais de livraison ?",
    a: "7 à 15 jours ouvrés en France, Belgique et Suisse. Livraison suivie et offerte dès 100€ d'achat. Nous expédions également dans toute l'Europe.",
  },
  {
    q: "Comment fonctionne l'éclairage LED ?",
    a: "Un interrupteur discret est placé sous la maquette. Une pression l'allume pendant environ 20 secondes. La batterie lithium se recharge par USB (câble fourni), temps de charge ~1h.",
  },
  {
    q: "Quelle est votre politique de retour ?",
    a: "Satisfait ou remboursé 30 jours. Retour offert depuis la France. La maquette doit être retournée dans sa boîte d'origine, en parfait état.",
  },
];

export default function FAQ({ items = DEFAULT_ITEMS }: { items?: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-ink-border border border-ink-border rounded-2xl overflow-hidden bg-ink-600/40">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-ink-500/40 transition"
              aria-expanded={isOpen}
            >
              <span className="display text-sm md:text-base text-white">{item.q}</span>
              <span
                className={`h-7 w-7 grid place-items-center rounded-full border border-white/15 text-white/70 transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-mute text-sm md:text-base leading-relaxed">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
