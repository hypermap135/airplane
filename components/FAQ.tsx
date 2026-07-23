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
    a: "L'éclairage s'active de deux façons : un tap sur le fuselage, ou un clap des mains à proximité de l'avion. Le fuselage et le cockpit s'allument pendant environ 20 secondes — puis l'éclairage s'éteint automatiquement pour préserver la durée de vie de la batterie lithium. Recharge par USB (câble fourni), temps de charge ~1h.",
  },
  {
    q: "Quelle est votre politique de retour ?",
    a: "Satisfait ou remboursé 30 jours. Retour offert depuis la France. La maquette doit être retournée dans sa boîte d'origine, en parfait état.",
  },
  {
    q: "La maquette est-elle fragile ?",
    a: "Non. Nos maquettes sont coulées en résine monobloc sous pression — le même matériau utilisé pour les pièces industrielles. Elles résistent aux chocs du quotidien et ne se cassent pas comme le plastique ordinaire. L'emballage de livraison est conçu pour protéger la pièce pendant le transport.",
  },
  {
    q: "C'est un cadeau. Y a-t-il un emballage soigné ?",
    a: "Oui. Chaque maquette est livrée dans une boîte premium avec calage sur mesure. L'emballage est pensé pour être offert directement. Vous pouvez également ajouter une gravure personnalisée (+15€) pour rendre le cadeau inoubliable.",
  },
  {
    q: "Puis-je payer en plusieurs fois ?",
    a: "Oui. Le paiement en 3x ou 4x sans frais est disponible au moment du règlement. Vous pouvez régler par carte bancaire, PayPal ou Apple Pay. Toutes les transactions sont sécurisées SSL.",
  },
  {
    q: "Est-ce une copie bon marché fabriquée en Chine ?",
    a: "Absolument pas. Nos maquettes sont fabriquées en résine haute densité, peintes à la main, et contrôlées pièce par pièce avant expédition. Elles ne peuvent pas être comparées aux reproductions plastique que l'on trouve sur les marketplaces. C'est pour cela que 347 clients — dont de nombreux pilotes et collectionneurs — nous font confiance.",
  },
];

export default function FAQ({ items = DEFAULT_ITEMS }: { items?: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="rounded-md border border-ink-line bg-white overflow-hidden">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            style={{ borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none" }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 transition-colors"
              style={{ background: isOpen ? "var(--brand-blue-light)" : "transparent", cursor: "pointer" }}
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-sm text-ink-900">{item.q}</span>
              <span
                aria-hidden
                className="shrink-0 grid place-items-center rounded-full transition-transform"
                style={{
                  width: 28,
                  height: 28,
                  border: `1px solid ${isOpen ? "var(--brand-blue)" : "var(--line)"}`,
                  color: isOpen ? "var(--brand-blue)" : "var(--ink-500)",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className="text-sm text-ink-500 leading-relaxed px-5 pb-4">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
