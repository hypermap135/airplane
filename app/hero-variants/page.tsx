"use client";

import { useState } from "react";
import HeroV1FlightDeck from "@/components/heroes/HeroV1FlightDeck";
import HeroV2BoardingPass from "@/components/heroes/HeroV2BoardingPass";
import HeroV3HangarMarquee from "@/components/heroes/HeroV3HangarMarquee";

const VARIANTS = [
  { key: "v1", label: "V1 · Flight Deck", Comp: HeroV1FlightDeck },
  { key: "v2", label: "V2 · Boarding Pass", Comp: HeroV2BoardingPass },
  { key: "v3", label: "V3 · Hangar Marquee", Comp: HeroV3HangarMarquee },
] as const;

export default function HeroVariantsPage() {
  const [active, setActive] = useState<(typeof VARIANTS)[number]["key"]>("v1");
  const Active = VARIANTS.find((v) => v.key === active)!.Comp;

  return (
    <>
      {/* Floating switcher */}
      <div className="fixed top-24 right-5 z-[100] flex flex-col gap-2 p-2 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-[0_20px_60px_-20px_rgba(58,142,255,0.45)]">
        <span className="hud text-white/50 px-3 pt-1">Variantes Hero</span>
        {VARIANTS.map((v) => {
          const isActive = v.key === active;
          return (
            <button
              key={v.key}
              onClick={() => setActive(v.key)}
              className={`text-left px-3 py-2 rounded-lg text-xs font-mono tracking-wide transition ${
                isActive
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      <Active key={active} />
    </>
  );
}
