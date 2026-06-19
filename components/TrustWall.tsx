"use client";

/**
 * TrustWall — review-platform-flavored social proof block.
 *
 * Replaces the cold "La maison en chiffres" stats block with a layout
 * that breathes "lots of real reviews": a giant 4.9/5 score up top, two
 * counter-rotating marquees of short customer quotes, and a row of
 * factual chips (made in France / 30j retour / Stripe / livré 7-15j).
 *
 * Quote text reuses the existing copy from ReviewsSection so the two
 * surfaces stay coherent — the visitor sees the same voice twice on
 * the page.
 */

const QUOTES = [
  { who: "Cpt Thomas R., commandant AF",        body: "Une sculpture. On ne dit pas maquette, on dit sculpture." },
  { who: "Marc D., pilote retraité",            body: "Jamais vu une telle qualité à ce prix. Les couleurs fidèles à la livrée." },
  { who: "Sophie L., fille de pilote",          body: "Mon père était en larmes. L'emballage est soigné, la maquette superbe." },
  { who: "Alexandre M., passionné",             body: "Bluffant. Le socle bois, les finitions — tout est pensé." },
  { who: "Isabelle R., 2e commande",            body: "Maquettes magnifiques. J'ai offert le pack à mon mari pilote, impressionné." },
  { who: "Thomas C., contrôleur aérien",        body: "Trône sur mon bureau depuis le jour de livraison. Mes collègues me demandent où." },
  { who: "Jean-Pierre V., ancien mécano nav",   body: "Livraison soignée, peinture parfaite. Fait avec passion." },
  { who: "Camille B., cadeau coup de cœur",     body: "J'ai failli ne pas commander — la meilleure décision que j'aie prise." },
];

const FACTS = [
  { icon: "🇫🇷", label: "Marque française" },
  { icon: "↩️", label: "30 jours retour" },
  { icon: "🔒", label: "Paiement Stripe sécurisé" },
  { icon: "🚚", label: "Livré 7–15 j en Europe" },
];

// Pre-split into 2 rows so each marquee runs independently.
const ROW_A = QUOTES.slice(0, 4);
const ROW_B = QUOTES.slice(4);

export default function TrustWall() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #06060f 0%, #03030a 100%)",
        paddingTop: "5rem",
        paddingBottom: "5rem",
      }}
    >
      {/* Soft radial accent behind the score */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(255,180,77,0.10) 0%, transparent 60%)",
        }}
      />

      {/* ── HEADER: editorial eyebrow + giant score ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-12 text-center mb-12 md:mb-14">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div aria-hidden style={{ width: 28, height: 1, background: "rgba(255,180,77,0.55)" }} />
          <span
            className="font-mono uppercase"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.32em",
              color: "rgba(255,200,140,0.85)",
            }}
          >
            ★ Ils en parlent mieux que nous
          </span>
          <div aria-hidden style={{ width: 28, height: 1, background: "rgba(255,180,77,0.55)" }} />
        </div>

        {/* Giant score */}
        <div className="flex items-end justify-center gap-3 md:gap-4 mb-3">
          <span
            className="font-black"
            style={{
              fontSize: "clamp(4rem, 11vw, 8rem)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              background: "linear-gradient(180deg,#fff 0%,#c8cfdc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            4,9
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "clamp(1rem, 1.6vw, 1.4rem)",
              color: "rgba(255,255,255,0.4)",
              paddingBottom: "0.6rem",
              letterSpacing: "0.06em",
            }}
          >
            /5
          </span>
        </div>

        {/* 5 gold stars */}
        <div className="flex items-center justify-center gap-1 mb-3" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="22" height="22" viewBox="0 0 24 24" fill="url(#g-gold)" style={{ filter: "drop-shadow(0 2px 6px rgba(245,158,11,0.35))" }}>
              <defs>
                <linearGradient id="g-gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffe28a" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        <p
          className="text-white/55 mx-auto"
          style={{ fontSize: "0.95rem", maxWidth: 520 }}
        >
          Note moyenne des clients qui ont reçu leur maquette
          {" · "}
          <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
            verified buyers only
          </span>
        </p>
      </div>

      {/* ── MARQUEE ROW A — left ── */}
      <div
        className="relative z-10 overflow-hidden mb-3 md:mb-4"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div className="trust-marquee-row trust-marquee-left flex gap-4 md:gap-5 w-max">
          {[...ROW_A, ...ROW_A, ...ROW_A].map((q, i) => (
            <QuoteChip key={`a${i}`} who={q.who} body={q.body} />
          ))}
        </div>
      </div>

      {/* ── MARQUEE ROW B — right (opposite direction) ── */}
      <div
        className="relative z-10 overflow-hidden mb-10 md:mb-14"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div className="trust-marquee-row trust-marquee-right flex gap-4 md:gap-5 w-max">
          {[...ROW_B, ...ROW_B, ...ROW_B].map((q, i) => (
            <QuoteChip key={`b${i}`} who={q.who} body={q.body} />
          ))}
        </div>
      </div>

      {/* ── FACT CHIPS ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-12">
        <ul className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
          {FACTS.map((f, i) => (
            <li key={i}>
              <span
                className="inline-flex items-center gap-2 px-4 py-2 text-white/80"
                style={{
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  fontSize: "0.78rem",
                }}
              >
                <span aria-hidden style={{ fontSize: "0.95rem" }}>{f.icon}</span>
                <span>{f.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .trust-marquee-row {
          animation-duration: 38s;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        .trust-marquee-left {
          animation-name: trust-marquee-left;
        }
        .trust-marquee-right {
          animation-name: trust-marquee-right;
          animation-duration: 44s;
        }
        @keyframes trust-marquee-left {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes trust-marquee-right {
          0%   { transform: translateX(-33.333%); }
          100% { transform: translateX(0%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .trust-marquee-row { animation: none; }
        }
      `}</style>
    </section>
  );
}

function QuoteChip({ who, body }: { who: string; body: string }) {
  return (
    <div
      className="shrink-0 px-5 py-3 md:px-6 md:py-4"
      style={{
        borderRadius: 14,
        background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        maxWidth: 420,
        minWidth: 280,
      }}
    >
      <div className="flex items-center gap-1 mb-1.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: "#f59e0b", fontSize: "0.7rem", lineHeight: 1 }}>★</span>
        ))}
      </div>
      <p
        className="text-white/85 mb-1.5"
        style={{ fontSize: "0.85rem", lineHeight: 1.4 }}
      >
        “{body}”
      </p>
      <p
        className="font-mono uppercase"
        style={{
          fontSize: "0.55rem",
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        — {who}
      </p>
    </div>
  );
}
