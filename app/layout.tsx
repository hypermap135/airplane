import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

// Une seule famille — Inter suffit (sans-serif propre, chargement rapide).
// Space_Grotesk + IBM_Plex_Mono retirés : n'étaient plus utilisés après la
// refonte light et alourdissaient le premier paint.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AirplaneStore — Maquettes d'avion premium · Entreprise française",
    template: "%s · AirplaneStore",
  },
  description:
    "Maquettes d'avion en résine monobloc, peintes main dans nos usines partenaires, LED intégré. Airbus, Boeing, Concorde, jets privés. Entreprise française · livraison 7-15 j · satisfait ou remboursé 30 j.",
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
    "entreprise française",
  ],
  category: "shopping",
  metadataBase: new URL("https://airplanestore.fr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AirplaneStore — Maquettes d'avion premium · Entreprise française",
    description:
      "Maquettes d'avion en résine monobloc, peintes main dans nos usines partenaires, LED intégré. Airbus, Boeing, Concorde — entreprise française · livraison 7-15 j.",
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
    title: "AirplaneStore — Maquettes d'avion premium · Entreprise française",
    description:
      "Maquettes d'avion en résine monobloc, LED intégré. Airbus, Boeing, Concorde — entreprise française.",
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
  // OnlineStore is a Schema.org subtype of Organization, used by Google
  // specifically for e-commerce sites. It unlocks the "Shop" badges and
  // helps the Merchant Knowledge Panel populate.
  "@type": "OnlineStore",
  name: "AirplaneStore",
  alternateName: "Airplane Store",
  url: "https://airplanestore.fr",
  logo: {
    "@type": "ImageObject",
    url: "https://airplanestore.fr/logo-512.png",
    width: 512,
    height: 512,
  },
  image: "https://airplanestore.fr/og-image.png",
  description:
    "Maquettes d'avion en résine monobloc, peintes main dans nos usines partenaires, LED intégré. Airbus, Boeing, Concorde, jets privés. Entreprise française.",
  slogan: "Maquettes d'avion premium · Entreprise française",
  email: "hypermap.pro@gmail.com",
  priceRange: "€€",
  paymentAccepted: [
    "Credit Card",
    "Visa",
    "Mastercard",
    "American Express",
    "Apple Pay",
    "Google Pay",
  ],
  currenciesAccepted: "EUR",
  areaServed: [
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Belgique" },
    { "@type": "Country", name: "Suisse" },
    { "@type": "Country", name: "Luxembourg" },
    { "@type": "Place",   name: "Europe" },
  ],
  // Note: `address` PostalAddress is intentionally omitted — this is a
  // pure online store with no physical showroom. areaServed alone is
  // enough for Google to know where we ship; declaring an empty/partial
  // PostalAddress would just trigger "field missing (optional)" warnings
  // in Rich Results test without any SEO benefit.
  // aggregateRating intentionally omitted until real reviews are wired in
  // (Judge.me / Trustpilot). Emitting fake schema data triggers Google
  // manual actions.
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
    <html lang="fr" className={inter.variable}>
      <head>
        {/* Preconnect au CDN Shopify (photos produits + checkout) — économise
            ~100ms sur le premier chargement d'image Shopify */}
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://y823wg-nz.myshopify.com" />

        {/* Preload du LCP (hero) — Next/Image l'optimise via /_next/image,
            donc on préfère laisser le loader gérer. Tag priority sur <Image>
            suffit pour ce cas. */}

        {/* JSON-LD statique — inline dans <head>, pas bloquant (parsed as data) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_LD) }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* Cleanup stale Shopify service worker — after main content painted */}
        <Script id="sw-cleanup" strategy="lazyOnload">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
              regs.forEach(function(r) { r.unregister(); });
            }).catch(function(){});
          }
        `}</Script>

        {/* Meta Pixel — lazyOnload pour ne pas bloquer le LCP */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="lazyOnload">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${META_PIXEL_ID}');
            fbq('track','PageView');
          `}</Script>
        )}

        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
