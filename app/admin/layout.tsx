import type { ReactNode } from "react";

export const metadata = {
  title: "Admin · AirplaneStore",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

/**
 * Admin layout — no header / footer / smooth-scroll wrapper from the public
 * site. Just a dark page with a max-width container. The auth gate itself
 * lives in middleware.ts (redirects to /admin/login when not signed in).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100svh",
        background: "#06060f",
        color: "#f0f2f5",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
