"use client";

/**
 * Was a Lenis smooth-scroll wrapper. Now a no-op pass-through — Lenis was
 * intercepting programmatic scrolls and adding perceived lag on click.
 * Kept as a named component so callers don't need to be rewritten; can be
 * deleted once no one imports it.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
