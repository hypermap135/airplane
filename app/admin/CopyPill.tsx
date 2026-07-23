"use client";

import { useRef } from "react";

/**
 * Small "click to copy" pill used inside the admin home product cards.
 *
 * Renders as a chip that stops event propagation so clicking it never
 * navigates to the parent <Link>. On click it copies `value` and flashes
 * "Copié" for 1.2 s.
 */
export default function CopyPill({
  label,
  value,
  title,
}: {
  label: string;
  value: string;
  title?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const flashOk = () => {
    const el = ref.current;
    if (!el) return;
    el.dataset.copied = "1";
    el.textContent = "✓ Copié";
    window.setTimeout(() => {
      el.dataset.copied = "";
      el.textContent = label;
    }, 1200);
  };
  const copy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(flashOk).catch(() => {});
  };
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      title={title ?? value}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        copy();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          copy();
        }
      }}
      style={{
        marginTop: "auto",
        padding: "6px 10px",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.14em",
        textAlign: "center",
        borderRadius: 6,
        background: "rgba(58,142,255,0.12)",
        border: "1px solid rgba(58,142,255,0.35)",
        color: "#c5daff",
        cursor: "copy",
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );
}
