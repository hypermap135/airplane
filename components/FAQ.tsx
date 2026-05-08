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
    a: "Absolument pas. Nos maquettes sont fabriquées en résine haute densité, peintes à la main, et contrôlées pièce par pièce avant expédition. Elles ne peuvent pas être comparées aux reproductions plastique que l'on trouve sur les marketplaces. C'est pour cela que 1 847 clients — dont de nombreux pilotes et collectionneurs — nous font confiance.",
  },
];

export default function FAQ({ items = DEFAULT_ITEMS }: { items?: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div style={{
      borderRadius: "1.25rem",
      border: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(12,12,26,0.5)",
      overflow: "hidden",
    }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} style={{ borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left transition-colors duration-200"
              style={{
                padding: "1.25rem 1.5rem",
                background: isOpen ? "rgba(58,142,255,0.04)" : "transparent",
              }}
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-[0.88rem] leading-snug"
                style={{ color: isOpen ? "#ffffff" : "rgba(255,255,255,0.8)" }}>
                {item.q}
              </span>
              <span
                className="shrink-0 grid place-items-center transition-transform duration-300"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `1px solid ${isOpen ? "rgba(58,142,255,0.5)" : "rgba(255,255,255,0.12)"}`,
                  color: isOpen ? "#3a8eff" : "rgba(255,255,255,0.5)",
                  fontSize: "1rem",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
                aria-hidden
              >
                +
              </span>
            </button>

            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <p className="text-[0.85rem] leading-relaxed" style={{ padding: "0 1.5rem 1.25rem", color: "#565870" }}>
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
