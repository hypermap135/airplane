"use client";

import { useState, useTransition } from "react";
import type { SiteContent, HeroContent, CorporateContent, CorporateCase, FAQItem } from "@/lib/site-content";

type Tab = "hero" | "corporate" | "faq";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  fontSize: "0.85rem",
  borderRadius: 8,
  background: "#07070f",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  outline: "none",
};

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(160deg,#0d0d1a 0%,#0a0a14 100%)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  padding: "1.4rem",
  marginBottom: "1rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.65rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.55)",
  marginBottom: 6,
  marginTop: 12,
};

export default function ContentEditor({ initial }: { initial: SiteContent }) {
  const [tab, setTab] = useState<Tab>("hero");
  const [hero, setHero] = useState<HeroContent>(initial.hero);
  const [corp, setCorp] = useState<CorporateContent>(initial.corporate);
  const [faq, setFaq] = useState<FAQItem[]>(initial.faq);
  const [busy, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function saveSection(section: Tab, data: unknown) {
    setMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, data }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setMsg({ kind: "err", text: j?.detail ?? j?.error ?? "Erreur d'enregistrement" });
          return;
        }
        setMsg({ kind: "ok", text: "Enregistré ✓ — visible sur le site dans ~30 s" });
      } catch {
        setMsg({ kind: "err", text: "Réseau indisponible" });
      }
    });
  }

  async function uploadImage(file: File, folder: string): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      setMsg({ kind: "err", text: "Upload échoué" });
      return null;
    }
    const j = await res.json();
    return j.url as string;
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["hero", "corporate", "faq"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.6rem 1.2rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              borderRadius: 999,
              cursor: "pointer",
              background: tab === t ? "rgba(58,142,255,0.18)" : "transparent",
              color: tab === t ? "#3a8eff" : "rgba(255,255,255,0.6)",
              border: `1px solid ${tab === t ? "rgba(58,142,255,0.45)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {t === "hero" && "Hero d'accueil"}
            {t === "corporate" && `Cas entreprises (${corp.cases.length})`}
            {t === "faq" && `FAQ (${faq.length})`}
          </button>
        ))}
      </div>

      {msg && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            marginBottom: 16,
            background: msg.kind === "ok" ? "rgba(59,184,121,0.12)" : "rgba(255,90,90,0.12)",
            border: `1px solid ${msg.kind === "ok" ? "rgba(59,184,121,0.4)" : "rgba(255,90,90,0.4)"}`,
            color: msg.kind === "ok" ? "#7be5b5" : "#ffb0b0",
            fontSize: "0.85rem",
          }}
        >
          {msg.text}
        </div>
      )}

      {/* ── HERO tab ── */}
      {tab === "hero" && (
        <div style={cardStyle}>
          <label style={labelStyle}>Badge (petite étiquette bleu clair au-dessus du titre)</label>
          <input style={inputStyle} value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />

          <label style={labelStyle}>Titre — ligne 1 (noir)</label>
          <input style={inputStyle} value={hero.titleLine1} onChange={(e) => setHero({ ...hero, titleLine1: e.target.value })} />

          <label style={labelStyle}>Titre — mots en couleur bleue, ligne 2</label>
          <input style={inputStyle} value={hero.titleHighlight1} onChange={(e) => setHero({ ...hero, titleHighlight1: e.target.value })} />

          <label style={labelStyle}>Titre — mots en couleur bleue, ligne 3</label>
          <input style={inputStyle} value={hero.titleHighlight2} onChange={(e) => setHero({ ...hero, titleHighlight2: e.target.value })} />

          <label style={labelStyle}>Sous-titre / promesse</label>
          <textarea style={{ ...inputStyle, minHeight: 90 }} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <div>
              <label style={labelStyle}>Bouton principal — texte</label>
              <input style={inputStyle} value={hero.ctaPrimaryLabel} onChange={(e) => setHero({ ...hero, ctaPrimaryLabel: e.target.value })} />
              <label style={labelStyle}>Bouton principal — lien</label>
              <input style={inputStyle} value={hero.ctaPrimaryHref} onChange={(e) => setHero({ ...hero, ctaPrimaryHref: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Bouton secondaire — texte</label>
              <input style={inputStyle} value={hero.ctaSecondaryLabel} onChange={(e) => setHero({ ...hero, ctaSecondaryLabel: e.target.value })} />
              <label style={labelStyle}>Bouton secondaire — lien</label>
              <input style={inputStyle} value={hero.ctaSecondaryHref} onChange={(e) => setHero({ ...hero, ctaSecondaryHref: e.target.value })} />
            </div>
          </div>

          <label style={labelStyle}>Image du hero (URL ou upload)</label>
          <input style={inputStyle} value={hero.imageUrl} onChange={(e) => setHero({ ...hero, imageUrl: e.target.value })} />
          <label
            style={{
              display: "inline-block",
              marginTop: 10,
              padding: "0.6rem 1rem",
              borderRadius: 999,
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              background: "rgba(58,142,255,0.12)",
              border: "1px solid rgba(58,142,255,0.4)",
              color: "#3a8eff",
            }}
          >
            Choisir une nouvelle image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: "none" }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadImage(f, "hero");
                if (url) setHero({ ...hero, imageUrl: url });
                e.target.value = "";
              }}
            />
          </label>

          <label style={labelStyle}>Alt image (SEO + accessibilité)</label>
          <input style={inputStyle} value={hero.imageAlt} onChange={(e) => setHero({ ...hero, imageAlt: e.target.value })} />

          <div style={{ marginTop: 20 }}>
            <SaveButton busy={busy} onClick={() => saveSection("hero", hero)} />
          </div>
        </div>
      )}

      {/* ── CORPORATE tab ── */}
      {tab === "corporate" && (
        <>
          <div style={cardStyle}>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(58,142,255,0.8)", marginBottom: 10 }}>
              En-tête de section
            </div>
            <label style={labelStyle}>Étiquette (petit texte bleu)</label>
            <input style={inputStyle} value={corp.sectionTag} onChange={(e) => setCorp({ ...corp, sectionTag: e.target.value })} />
            <label style={labelStyle}>Titre H2</label>
            <input style={inputStyle} value={corp.sectionTitle} onChange={(e) => setCorp({ ...corp, sectionTitle: e.target.value })} />
            <label style={labelStyle}>Sous-titre</label>
            <textarea style={{ ...inputStyle, minHeight: 70 }} value={corp.sectionSubtitle} onChange={(e) => setCorp({ ...corp, sectionSubtitle: e.target.value })} />

            <label style={labelStyle}>Logos affichés (un par ligne)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 90 }}
              value={corp.logos.join("\n")}
              onChange={(e) => setCorp({ ...corp, logos: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
            />
          </div>

          {corp.cases.map((c, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(58,142,255,0.8)" }}>
                  Cas #{i + 1}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <MiniBtn onClick={() => moveCase(corp, setCorp, i, -1)} disabled={i === 0}>↑</MiniBtn>
                  <MiniBtn onClick={() => moveCase(corp, setCorp, i, +1)} disabled={i === corp.cases.length - 1}>↓</MiniBtn>
                  <MiniBtn danger onClick={() => setCorp({ ...corp, cases: corp.cases.filter((_, k) => k !== i) })}>✕</MiniBtn>
                </div>
              </div>

              <label style={labelStyle}>Tag (ex: Cadeau clients)</label>
              <input style={inputStyle} value={c.tag} onChange={(e) => updateCase(corp, setCorp, i, { tag: e.target.value })} />
              <label style={labelStyle}>Titre</label>
              <input style={inputStyle} value={c.title} onChange={(e) => updateCase(corp, setCorp, i, { title: e.target.value })} />
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 100 }} value={c.body} onChange={(e) => updateCase(corp, setCorp, i, { body: e.target.value })} />
              <label style={labelStyle}>Image URL</label>
              <input style={inputStyle} value={c.image} onChange={(e) => updateCase(corp, setCorp, i, { image: e.target.value })} />
              <label
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "0.5rem 0.9rem",
                  borderRadius: 999,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  background: "rgba(58,142,255,0.12)",
                  border: "1px solid rgba(58,142,255,0.4)",
                  color: "#3a8eff",
                }}
              >
                Uploader une photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await uploadImage(f, `corporate-${i}`);
                    if (url) updateCase(corp, setCorp, i, { image: url });
                    e.target.value = "";
                  }}
                />
              </label>
              <label style={labelStyle}>Couleur d'accent (hex)</label>
              <input style={inputStyle} value={c.accent} onChange={(e) => updateCase(corp, setCorp, i, { accent: e.target.value })} />
            </div>
          ))}

          <button
            onClick={() => setCorp({
              ...corp,
              cases: [...corp.cases, { tag: "Nouveau", title: "", body: "", image: "", accent: "#c9a24b" }],
            })}
            style={{
              padding: "0.7rem 1.2rem",
              fontSize: "0.78rem",
              fontWeight: 600,
              borderRadius: 999,
              cursor: "pointer",
              background: "rgba(58,142,255,0.12)",
              border: "1px solid rgba(58,142,255,0.4)",
              color: "#3a8eff",
              marginBottom: 20,
            }}
          >
            + Ajouter un cas
          </button>

          <div style={{ marginTop: 20 }}>
            <SaveButton busy={busy} onClick={() => saveSection("corporate", corp)} />
          </div>
        </>
      )}

      {/* ── FAQ tab ── */}
      {tab === "faq" && (
        <>
          {faq.map((item, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(58,142,255,0.8)" }}>
                  Question #{i + 1}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <MiniBtn onClick={() => setFaq(reorder(faq, i, -1))} disabled={i === 0}>↑</MiniBtn>
                  <MiniBtn onClick={() => setFaq(reorder(faq, i, +1))} disabled={i === faq.length - 1}>↓</MiniBtn>
                  <MiniBtn danger onClick={() => setFaq(faq.filter((_, k) => k !== i))}>✕</MiniBtn>
                </div>
              </div>
              <label style={labelStyle}>Question</label>
              <input style={inputStyle} value={item.q} onChange={(e) => setFaq(faq.map((it, k) => k === i ? { ...it, q: e.target.value } : it))} />
              <label style={labelStyle}>Réponse</label>
              <textarea style={{ ...inputStyle, minHeight: 100 }} value={item.a} onChange={(e) => setFaq(faq.map((it, k) => k === i ? { ...it, a: e.target.value } : it))} />
            </div>
          ))}

          <button
            onClick={() => setFaq([...faq, { q: "", a: "" }])}
            style={{
              padding: "0.7rem 1.2rem",
              fontSize: "0.78rem",
              fontWeight: 600,
              borderRadius: 999,
              cursor: "pointer",
              background: "rgba(58,142,255,0.12)",
              border: "1px solid rgba(58,142,255,0.4)",
              color: "#3a8eff",
              marginBottom: 20,
            }}
          >
            + Ajouter une question
          </button>

          <div style={{ marginTop: 20 }}>
            <SaveButton busy={busy} onClick={() => saveSection("faq", faq)} />
          </div>
        </>
      )}
    </div>
  );
}

function updateCase(corp: CorporateContent, setCorp: (c: CorporateContent) => void, i: number, patch: Partial<CorporateCase>) {
  setCorp({ ...corp, cases: corp.cases.map((c, k) => k === i ? { ...c, ...patch } : c) });
}

function moveCase(corp: CorporateContent, setCorp: (c: CorporateContent) => void, i: number, dir: -1 | 1) {
  setCorp({ ...corp, cases: reorder(corp.cases, i, dir) });
}

function reorder<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function SaveButton({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      style={{
        padding: "0.95rem 2rem",
        fontSize: "0.78rem",
        fontWeight: 800,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        borderRadius: 999,
        cursor: busy ? "wait" : "pointer",
        background: "linear-gradient(135deg,#3a8eff,#1c7ee6)",
        border: "1px solid rgba(58,142,255,0.6)",
        color: "#fff",
        opacity: busy ? 0.6 : 1,
      }}
    >
      {busy ? "Enregistrement…" : "Enregistrer les modifications"}
    </button>
  );
}

function MiniBtn({ children, onClick, disabled, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        background: danger ? "rgba(255,90,90,0.12)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${danger ? "rgba(255,90,90,0.35)" : "rgba(255,255,255,0.15)"}`,
        color: danger ? "#ff8080" : "#fff",
        opacity: disabled ? 0.3 : 1,
        fontSize: "0.8rem",
      }}
    >
      {children}
    </button>
  );
}
