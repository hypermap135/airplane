import Image from "next/image";
import type { AirplaneStory, LiveryNote } from "@/lib/airplane-stories";

/**
 * Editorial "L'avion derrière la maquette" section, rendered under the
 * product fiche. Mixes a model-level history (shared across liveries) and
 * a livery-specific paragraph. Tone: aviation magazine, pas commercial.
 */
export default function AirplaneStorySection({
  story,
  livery,
  heroImage,
  heroAlt,
}: {
  story: AirplaneStory;
  livery: LiveryNote;
  heroImage: string;
  heroAlt: string;
}) {
  return (
    <section
      className="mt-24 md:mt-32"
      aria-labelledby="story-heading"
      style={{
        // Subtle gradient slab to separate from the sales fiche above.
        background: "linear-gradient(180deg, transparent 0%, rgba(58,142,255,0.025) 50%, transparent 100%)",
        paddingTop: "4rem",
        paddingBottom: "4rem",
        marginLeft: "-1.5rem",
        marginRight: "-1.5rem",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
      }}
    >
      {/* ── Section eyebrow ── */}
      <div className="flex items-center gap-3 mb-4">
        <div
          aria-hidden
          style={{ width: 28, height: 1, background: "rgba(58,142,255,0.6)" }}
        />
        <span
          className="font-mono uppercase"
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.28em",
            color: "rgba(120,180,255,0.85)",
          }}
        >
          ★ L'avion derrière la maquette
        </span>
      </div>

      {/* ── Editorial heading ── */}
      <h2
        id="story-heading"
        className="font-black text-white mb-10"
        style={{
          fontSize: "clamp(1.8rem, 4vw, 3rem)",
          letterSpacing: "-0.025em",
          lineHeight: 1,
          background: "linear-gradient(180deg,#fff 0%,#cfd6e4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        L'histoire d'un géant.
      </h2>

      {/* ── Hero image — full bleed, no card border ── */}
      <div
        className="relative mb-10 md:mb-12"
        style={{
          aspectRatio: "4/3",
        }}
      >
        <Image
          src={heroImage}
          alt={heroAlt}
          fill
          sizes="(min-width: 1024px) 80vw, 100vw"
          quality={92}
          className="object-cover"
        />
      </div>

      {/* ── Intro + livery paragraphs (2-column on desktop) ── */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-14 md:mb-16">
        <div className="space-y-4">
          {story.intro.map((p, i) => (
            <p
              key={i}
              className="text-white/75 leading-relaxed"
              style={{ fontSize: "0.95rem" }}
            >
              {p}
            </p>
          ))}
        </div>

        <div
          className="rounded-2xl p-5 md:p-6"
          style={{
            background: "linear-gradient(145deg, rgba(58,142,255,0.06) 0%, rgba(58,142,255,0.02) 100%)",
            border: "1px solid rgba(58,142,255,0.20)",
          }}
        >
          <p
            className="font-mono uppercase mb-3"
            style={{
              fontSize: "0.58rem",
              letterSpacing: "0.24em",
              color: "rgba(120,180,255,0.85)",
            }}
          >
            La livrée
          </p>
          <p
            className="text-white leading-relaxed"
            style={{ fontSize: "0.92rem" }}
          >
            {livery.paragraph}
          </p>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="mb-14 md:mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div
            aria-hidden
            style={{ width: 20, height: 1, background: "rgba(255,255,255,0.25)" }}
          />
          <span
            className="font-mono uppercase text-white/60"
            style={{ fontSize: "0.6rem", letterSpacing: "0.24em" }}
          >
            Chronologie
          </span>
        </div>
        <ol className="relative space-y-5 md:space-y-6 pl-6 md:pl-8">
          {/* Vertical rail */}
          <div
            aria-hidden
            className="absolute left-1.5 top-2 bottom-2 w-px"
            style={{
              background:
                "linear-gradient(to bottom, rgba(58,142,255,0.4) 0%, rgba(58,142,255,0.05) 100%)",
            }}
          />
          {story.timeline.map((t, i) => (
            <li key={i} className="relative">
              {/* Dot */}
              <span
                aria-hidden
                className="absolute -left-[1.55rem] md:-left-[2.05rem] top-1.5 w-3 h-3 rounded-full"
                style={{
                  background: "#3a8eff",
                  boxShadow: "0 0 0 4px rgba(58,142,255,0.12)",
                }}
              />
              <div className="flex items-baseline gap-3 md:gap-4">
                <span
                  className="font-mono font-bold shrink-0"
                  style={{
                    color: "rgba(120,180,255,0.95)",
                    fontSize: "0.9rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  {t.year}
                </span>
                <span className="text-white/80" style={{ fontSize: "0.92rem" }}>
                  {t.event}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Specs cards ── */}
      <div className="mb-14 md:mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div
            aria-hidden
            style={{ width: 20, height: 1, background: "rgba(255,255,255,0.25)" }}
          />
          <span
            className="font-mono uppercase text-white/60"
            style={{ fontSize: "0.6rem", letterSpacing: "0.24em" }}
          >
            Fiche technique
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Capacité", value: story.specs.capacity },
            { label: "Portée", value: story.specs.range },
            { label: "Longueur", value: story.specs.length },
            { label: "Croisière", value: story.specs.cruise },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4 md:p-5"
              style={{
                background: "linear-gradient(145deg,#0c0c1c 0%,#070710 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="font-mono uppercase mb-2"
                style={{
                  fontSize: "0.55rem",
                  letterSpacing: "0.22em",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {s.label}
              </p>
              <p
                className="font-black"
                style={{
                  fontSize: "clamp(1.05rem, 2vw, 1.45rem)",
                  letterSpacing: "-0.02em",
                  background: "linear-gradient(180deg,#fff 0%,#c8cfdc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Airlines chips ── */}
      <div className="mb-14 md:mb-16">
        <div className="flex items-center gap-3 mb-5">
          <div
            aria-hidden
            style={{ width: 20, height: 1, background: "rgba(255,255,255,0.25)" }}
          />
          <span
            className="font-mono uppercase text-white/60"
            style={{ fontSize: "0.6rem", letterSpacing: "0.24em" }}
          >
            Compagnies emblématiques
          </span>
        </div>
        <ul className="flex flex-wrap gap-2">
          {story.airlines.map((a) => (
            <li key={a}>
              <span
                className="inline-flex items-center px-3 py-1.5 text-white/85"
                style={{
                  fontSize: "0.78rem",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                {a}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Fun fact ── */}
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,180,77,0.08) 0%, rgba(255,140,66,0.03) 100%)",
          border: "1px solid rgba(255,180,77,0.25)",
        }}
      >
        <p
          className="font-mono uppercase mb-3"
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.28em",
            color: "rgba(255,180,77,0.95)",
          }}
        >
          ✦ Le saviez-vous ?
        </p>
        <h3
          className="font-bold text-white mb-3"
          style={{
            fontSize: "clamp(1.05rem,2.2vw,1.45rem)",
            letterSpacing: "-0.015em",
            lineHeight: 1.25,
          }}
        >
          {story.funFact.title}
        </h3>
        <p
          className="text-white/75 leading-relaxed"
          style={{ fontSize: "0.92rem" }}
        >
          {story.funFact.body}
        </p>
      </div>
    </section>
  );
}
