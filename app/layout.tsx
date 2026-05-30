import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const mono  = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500","700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AirplaneStore — Maquettes d'avion premium · Fait en France",
    template: "%s · AirplaneStore",
  },
  description:
    "Maquettes d'avion en résine monobloc, peintes main, LED intégré. Airbus, Boeing, Concorde, jets privés. Fait en France · livraison 7-15 j · satisfait ou remboursé 30 j.",
  applicationName: "AirplaneStore",
  authors: [{ name: "AirplaneStore", url: "https://airplanestore.fr" }],
  generator: "Next.js",
  keywords: [
    "maquette avion",
    "maquette résine",
    "Airbus A320",
    "Airbus A380",
    "Boeing 747",
    "Boeing 787",
    "Concorde",
    "Gulfstream",
    "modèle réduit avion",
    "maquette Air France",
    "maquette LED",
    "fait en France",
  ],
  category: "shopping",
  metadataBase: new URL("https://airplanestore.fr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AirplaneStore — Maquettes d'avion premium · Fait en France",
    description:
      "Maquettes d'avion en résine monobloc, peintes main, LED intégré. Airbus, Boeing, Concorde — fait en France · livraison 7-15 j.",
    url: "https://airplanestore.fr",
    type: "website",
    locale: "fr_FR",
    siteName: "AirplaneStore",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AirplaneStore — Maquettes d'avion en résine premium",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AirplaneStore — Maquettes d'avion premium · Fait en France",
    description:
      "Maquettes d'avion en résine monobloc, LED intégré. Airbus, Boeing, Concorde — fait en France.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  verification: {
    // google: "TOKEN_FROM_GOOGLE_SEARCH_CONSOLE",
    // Add when the user verifies the property in Search Console.
  },
};

/**
 * JSON-LD structured data emitted on every page so Google can show:
 *   - a brand logo badge next to the search result (Organization.logo)
 *   - the sitelinks search box (WebSite.potentialAction)
 *
 * Lives on every route via this root layout. Page-level JSON-LD (Product,
 * BreadcrumbList) is emitted from the specific page components.
 */
const ORG_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AirplaneStore",
  alternateName: "Airplane Store",
  url: "https://airplanestore.fr",
  logo: "https://airplanestore.fr/logo-512.png",
  description:
    "Maquettes d'avion en résine monobloc, peintes main, LED intégré. Fait en France.",
  email: "hypermap.pro@gmail.com",
  areaServed: ["FR", "BE", "CH", "LU", "EU"],
  sameAs: [
    // Add here once the social profiles exist:
    // "https://www.instagram.com/airplanestore",
    // "https://www.facebook.com/airplanestore",
    // "https://www.tiktok.com/@airplanestore",
  ],
};

const SITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AirplaneStore",
  url: "https://airplanestore.fr",
  inLanguage: "fr-FR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://airplanestore.fr/collections/all?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${space.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        {/* ── JSON-LD for Google: Organization + WebSite ── */}
        <Script
          id="ld-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_LD) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_LD) }}
        />

        {/* Unregister any stale Shopify service worker. No cache clearing,
            no reload — Next.js already busts caches via hashed filenames. */}
        <Script id="sw-cleanup" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
              regs.forEach(function(r) { r.unregister(); });
            }).catch(function(){});
          }
        `}</Script>

        {/* Meta Pixel — loads after interactive, only if env var is set */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${META_PIXEL_ID}');
            fbq('track','PageView');
          `}</Script>
        )}

        <SmoothScroll>
          <ScrollProgress />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </SmoothScroll>
      </body>
    </html>
  );
}
