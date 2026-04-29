"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FAQ from "./FAQ";

gsap.registerPlugin(ScrollTrigger);

const INLINE_STATS = [
  { label: "Livraison", value: "7–15 j" },
  { label: "Retour",    value: "30 jours" },
  { label: "Note",      value: "4.9 / 5" },
  { label: "Clients",   value: "+2 000" },
];

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef    = useRef<HTMLDivElement>(null);
  const faqRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(heroRef.current, { opacity: 0, y: 60, filter: "blur(10px)" });
        gsap.to(heroRef.current,
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: heroRef.current, start: "top 82%" } }
        );
        gsap.set(".cta-chip", { opacity: 0, x: -24, scale: 0.86 });
        gsap.to(".cta-chip",
          {
            opacity: 1, x: 0, scale: 1,
            stagger: 0.09, duration: 0.65, ease: "back.out(1.8)",
            scrollTrigger: { trigger: ".cta-chip", start: "top 88%" },
          }
        );
        if (faqRef.current?.children[0]) {
          gsap.set(faqRef.current.children[0], { opacity: 0, x: -40 });
          gsap.to(faqRef.current.children[0],
            { opacity: 1, x: 0, duration: 0.9, ease: "expo.out",
              scrollTrigger: { trigger: faqRef.current, start: "top 82%" } }
          );
        }
        if (faqRef.current?.children[1]) {
          gsap.set(faqRef.current.children[1], { opacity: 0, x: 40 });
          gsap.to(faqRef.current.children[1],
            { opacity: 1, x: 0, duration: 0.9, ease: "expo.out", delay: 0.1,
              scrollTrigger: { trigger: faqRef.current, start: "top 82%" } }
          );
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([heroRef.current, ".cta-chip"], { opacity: 1, x: 0, scale: 1, y: 0, filter: "none" });
        if (faqRef.current)
          gsap.set(Array.from(faqRef.current.children), { opacity: 1, x: 0 });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-36 overflow-hidden" style={{ background: "#06060f" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 90% 60% at 30% 40%, rgba(18,50,160,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 85% 70%, rgba(10,30,120,0.07) 0%, transparent 60%)",
      }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(58,142,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(58,142,255,0.018) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">

        {/* Main CTA block */}
        <div ref={heroRef} className="mb-20 md:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.6)" }} />
            <span className="font-mono text-[0.63rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
              Commander
            </span>
          </div>

          <h2 className="font-black uppercase leading-[0.9] tracking-tight mb-6"
            style={{
              fontSize: "clamp(2.8rem,6.5vw,5.5rem)",
              letterSpacing: "-0.02em",
              background: "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              maxWidth: "14ch",
            }}>
            Prête<br />à décoller.
          </h2>

          <p className="text-[1.05rem] leading-[1.75] mb-10" style={{ color: "#6a7080", maxWidth: 480 }}>
            Chaque passionné commence par une première pièce. Livraison France & Europe. 30 jours pour changer d&apos;avis.
          </p>

          <div className="flex flex-wrap gap-4 items-center mb-10">
            <Link href="/collections/all" className="btn-chrome">Voir la collection →</Link>
            <Link href="/collections/packs" className="btn-ghost">Découvrir les packs</Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {INLINE_STATS.map((s) => (
              <div key={s.label}
                className="cta-chip flex items-center gap-3 px-4 py-3"
                style={{
                  borderRadius: "0.875rem",
                  border: "1px solid #1c1c2e",
                  background: "rgba(12,12,26,0.7)",
                  backdropFilter: "blur(12px)",
                }}>
                <span className="font-mono text-[0.6rem] tracking-[0.18em] uppercase" style={{ color: "#3a4055" }}>
                  {s.label}
                </span>
                <span className="font-bold text-white text-[0.9rem]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mb-16" style={{
          height: 1,
          background: "linear-gradient(to right, rgba(58,142,255,0.3) 0%, rgba(58,142,255,0.08) 50%, transparent 100%)",
        }} />

        {/* FAQ */}
        <div ref={faqRef} className="grid gap-12 lg:grid-cols-2 items-start">
          <div>
            <div className="font-mono text-[0.63rem] tracking-[0.28em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Questions fréquentes
            </div>
            <h3 className="font-black uppercase leading-[0.9] tracking-tight"
              style={{
                fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                letterSpacing: "-0.02em",
                background: "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
              Vos<br />questions.
            </h3>
          </div>
          <div>
            <FAQ />
          </div>
        </div>
      </div>
    </section>
  );
}
