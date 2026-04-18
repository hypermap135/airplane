import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AirplaneStore — Maquettes d'avion en résine premium",
    template: "%s · AirplaneStore",
  },
  description:
    "Répliques fidèles en résine monobloc. Échelle 1/147. LED intégré. Livraison France & Europe. Satisfait ou remboursé 30 jours.",
  metadataBase: new URL("https://shop.airplanestore.fr"),
  openGraph: {
    title: "AirplaneStore — Maquettes d'avion en résine premium",
    description:
      "Répliques fidèles en résine monobloc. Échelle 1/147. LED intégré. Livraison France & Europe.",
    type: "website",
    locale: "fr_FR",
    siteName: "AirplaneStore",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${space.variable}`}>
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
