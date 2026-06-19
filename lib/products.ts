export type Collection =
  | "airbus"
  | "boeing"
  | "concorde"
  | "jet"
  | "chasse"
  | "packs"
  | "accessoires";

export type ProductSpec = { label: string; value: string };

/**
 * A single design/colour option of a product. When `variants` is present
 * on a Product, the PDP shows a chip selector and the add-to-cart line
 * uses the SELECTED variant's id instead of the product's default one.
 * `image` becomes the main hero when the variant is active.
 */
export type ProductVariant = {
  id: string;       // Shopify variant id, "0" when not yet created
  label: string;    // "AIR FRANCE SkyTeam"
  image: string;    // hero image when this variant is selected
};

export type Product = {
  id: string;
  variantId: string;
  handle: string;
  title: string;
  subtitle?: string;
  price: number;
  compareAt?: number;
  collection: Collection;
  inStock: boolean;
  comingSoon?: boolean;
  image: string;
  images?: string[];
  bestseller?: boolean;
  scale?: string;
  /** Per-product spec sheet shown on the product page. When undefined,
   *  ProductDetail falls back to a shared default. Editable from /admin. */
  specs?: ProductSpec[];
  /** Free-form long description editable from /admin. When set, replaces
   *  the marketing block on the product page. */
  description?: string;
  /** Multi-design product (e.g. the keychain with 8 embroidered models).
   *  When set, PDP renders a variant chip selector; add-to-cart routes
   *  through `variants[selected].id`. */
  variants?: ProductVariant[];
};

export const COLLECTIONS: { slug: Collection; label: string }[] = [
  { slug: "airbus",      label: "Airbus" },
  { slug: "boeing",      label: "Boeing" },
  { slug: "concorde",    label: "Concorde" },
  { slug: "chasse",      label: "Aviation militaire" },
  { slug: "jet",         label: "Jet privé" },
  { slug: "packs",       label: "Packs" },
  { slug: "accessoires", label: "Accessoires" },
];

const CDN = "https://cdn.shopify.com/s/files/1/0921/9312/8788/files";

export const PRODUCTS: Product[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // AIRBUS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "a220-af",
    variantId: "55663325446484",
    handle: "airbus-a220-air-france",
    title: "Airbus A220 Air France",
    subtitle: "A220-300 · livrée Air France · activation au toucher",
    price: 99,
    collection: "airbus",
    inStock: true,
    comingSoon: false,
    image: `/images/airbus-a220-air-france.png`,
    images: [
      `/images/airbus-a220-air-france.png`,
      `/images/airbus-a220-air-france--3quarter-front.png`,
      `/images/airbus-a220-air-france--3quarter-rear.png`,
      `/images/airbus-a220-air-france--top.png`,
      `/images/airbus-a220-air-france--shelf.png`,
      `/images/airbus-a220-air-france--desk.png`,
    ],
    bestseller: false,
    scale: "1/100",
  },
  {
    id: "a320-af",
    variantId: "53357075595604",
    handle: "a320-neo",
    title: "Airbus A320 Air France",
    subtitle: "Moyen-courrier de référence — livrée Air France",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/a320-neo.png`,
    images: [
      `/images/a320-neo.png`,
      `/images/a320-neo--3quarter-front.png`,
      `/images/a320-neo--3quarter-rear.png`,
      `/images/a320-neo--top.png`,
      `/images/a320-neo--shelf.png`,
      `/images/a320-neo--desk.png`,
    ],
    bestseller: false,
    scale: "1/85",
  },
  {
    id: "a320-new-livery-af",
    variantId: "53492404945236",
    handle: "airbus-a320-echelle-1-85-finition-premium",
    title: "Airbus A320 New Livery Air France",
    subtitle: "Nouvelle livrée 2021 — finition premium",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/airbus-a320-echelle-1-85-finition-premium.png`,
    images: [
      `/images/airbus-a320-echelle-1-85-finition-premium.png`,
      `/images/airbus-a320-echelle-1-85-finition-premium--3quarter-front.png`,
      `/images/airbus-a320-echelle-1-85-finition-premium--3quarter-rear.png`,
      `/images/airbus-a320-echelle-1-85-finition-premium--top.png`,
      `/images/airbus-a320-echelle-1-85-finition-premium--shelf.png`,
      `/images/airbus-a320-echelle-1-85-finition-premium--desk.png`,
    ],
    scale: "1/85",
  },
  {
    id: "a320-neo-transavia",
    variantId: "0",
    handle: "airbus-a320-neo-transavia",
    title: "Airbus A320 Néo Transavia",
    subtitle: "Livrée Transavia — A320 Néo, échelle 1/100",
    price: 99,
    collection: "airbus",
    // Awaiting real Transavia photo from the client (uploaded via Notion).
    // Keep as coming-soon until the photo lands; otherwise the product card
    // would show an Air France livery for a Transavia title.
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a320-neo-transavia.png`,
    images: [
      `/images/airbus-a320-neo-transavia.png`,
      `/images/airbus-a320-neo-transavia--3quarter-front.png`,
      `/images/airbus-a320-neo-transavia--3quarter-rear.png`,
      `/images/airbus-a320-neo-transavia--top.png`,
      `/images/airbus-a320-neo-transavia--shelf.png`,
      `/images/airbus-a320-neo-transavia--desk.png`,
    ],
    scale: "1/100",
  },
  {
    id: "a320-qatar-psg",
    variantId: "53519416721748",
    handle: "copie-airbus-a320-echelle-1-85-finition-premium",
    title: "Airbus A320 Qatar PSG Livery",
    subtitle: "Livrée sponsor — édition Paris Saint-Germain",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/copie-airbus-a320-echelle-1-85-finition-premium.png`,
    images: [
      `/images/copie-airbus-a320-echelle-1-85-finition-premium.png`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--3quarter-front.png`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--3quarter-rear.png`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--top.png`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--shelf.png`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--desk.png`,
    ],
    scale: "1/85",
  },
  {
    id: "a321-af",
    variantId: "50902114730324",
    handle: "a-321",
    title: "Airbus A321 Air France",
    subtitle: "Version allongée — livrée Air France",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/a-321.png`,
    images: [
      `/images/a-321.png`,
      `/images/a-321--3quarter-front.png`,
      `/images/a-321--3quarter-rear.png`,
      `/images/a-321--top.png`,
      `/images/a-321--shelf.png`,
      `/images/a-321--desk.png`,
    ],
    scale: "1/100",
  },
  {
    id: "a321-easyjet",
    variantId: "0",
    handle: "airbus-a321-easyjet",
    title: "Airbus A321 EasyJet",
    subtitle: "Livrée orange — EasyJet",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a321-easyjet.png`,
    images: [
      `/images/airbus-a321-easyjet.png`,
      `/images/airbus-a321-easyjet--3quarter-front.png`,
      `/images/airbus-a321-easyjet--3quarter-rear.png`,
      `/images/airbus-a321-easyjet--top.png`,
      `/images/airbus-a321-easyjet--shelf.png`,
      `/images/airbus-a321-easyjet--desk.png`,
    ],
    scale: "1/100",
  },
  {
    id: "a350-af",
    variantId: "50905226379604",
    handle: "maquette-avion-maquette-airbus-a350-airfrance",
    title: "Airbus A350 Air France",
    subtitle: "Long-courrier nouvelle génération — livrée Air France",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/maquette-avion-maquette-airbus-a350-airfrance.png`,
    images: [
      `/images/maquette-avion-maquette-airbus-a350-airfrance.png`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--3quarter-front.png`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--shelf.png`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--desk.png`,
    ],
    bestseller: false,
    scale: "1/142",
  },
  {
    id: "a350-singapore",
    variantId: "0",
    handle: "airbus-a350-singapore",
    title: "Airbus A350 Singapore Airlines",
    subtitle: "Long-courrier — livrée Singapore Airlines",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a350-singapore.png`,
    images: [
      `/images/airbus-a350-singapore.png`,
      `/images/airbus-a350-singapore--3quarter-rear.png`,
      `/images/airbus-a350-singapore--top.png`,
      `/images/airbus-a350-singapore--shelf.png`,
      `/images/airbus-a350-singapore--desk.png`,
    ],
    scale: "1/142",
  },
  {
    id: "a350-iberia",
    variantId: "0",
    handle: "airbus-a350-iberia",
    title: "Airbus A350 Iberia",
    subtitle: "Long-courrier — livrée Iberia",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a350-iberia.png`,
    images: [
      `/images/airbus-a350-iberia.png`,
      `/images/airbus-a350-iberia--3quarter-front.png`,
      `/images/airbus-a350-iberia--3quarter-rear.png`,
      `/images/airbus-a350-iberia--top.png`,
      `/images/airbus-a350-iberia--shelf.png`,
      `/images/airbus-a350-iberia--desk.png`,
    ],
    scale: "1/142",
  },
  {
    id: "a350-emirates",
    variantId: "0",
    handle: "airbus-a350-emirates",
    title: "Airbus A350 Emirates",
    subtitle: "Long-courrier — livrée Emirates",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a350-emirates.png`,
    images: [
      `/images/airbus-a350-emirates.png`,
      `/images/airbus-a350-emirates--3quarter-front.png`,
      `/images/airbus-a350-emirates--3quarter-rear.png`,
      `/images/airbus-a350-emirates--top.png`,
      `/images/airbus-a350-emirates--shelf.png`,
      `/images/airbus-a350-emirates--desk.png`,
    ],
    scale: "1/142",
  },
  {
    id: "a380-af",
    variantId: "50833322279252",
    handle: "maquette-avion-maquette-airbus-a380",
    title: "Airbus A380 Air France",
    subtitle: "Quadriréacteur long-courrier — livrée Air France",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/maquette-avion-maquette-airbus-a380.png`,
    images: [
      `/images/maquette-avion-maquette-airbus-a380.png`,
      `/images/maquette-avion-maquette-airbus-a380--3quarter-front.png`,
      `/images/maquette-avion-maquette-airbus-a380--3quarter-rear.png`,
      `/images/maquette-avion-maquette-airbus-a380--top.png`,
      `/images/maquette-avion-maquette-airbus-a380--shelf.png`,
      `/images/maquette-avion-maquette-airbus-a380--desk.png`,
    ],
    bestseller: true,
    scale: "1/160",
  },
  {
    id: "a380-singapore",
    variantId: "0",
    handle: "airbus-a380-singapore",
    title: "Airbus A380 Singapore Airlines",
    subtitle: "Géant des airs — livrée Singapore Airlines",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a380-singapore.png`,
    images: [
      `/images/airbus-a380-singapore.png`,
      `/images/airbus-a380-singapore--3quarter-front.png`,
      `/images/airbus-a380-singapore--3quarter-rear.png`,
      `/images/airbus-a380-singapore--top.png`,
      `/images/airbus-a380-singapore--shelf.png`,
      `/images/airbus-a380-singapore--desk.png`,
    ],
    scale: "1/160",
  },
  {
    id: "a380-emirates",
    variantId: "0",
    handle: "airbus-a380-emirates",
    title: "Airbus A380 Emirates",
    subtitle: "Géant des airs — livrée Emirates",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a380-emirates.png`,
    images: [
      `/images/airbus-a380-emirates.png`,
      `/images/airbus-a380-emirates--3quarter-front.png`,
      `/images/airbus-a380-emirates--3quarter-rear.png`,
      `/images/airbus-a380-emirates--top.png`,
      `/images/airbus-a380-emirates--shelf.png`,
      `/images/airbus-a380-emirates--desk.png`,
    ],
    scale: "1/160",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BOEING
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "b737-ryanair",
    variantId: "50905345753428",
    handle: "boeing-737-ryannair",
    title: "Boeing 737 Ryanair",
    subtitle: "Moyen-courrier low-cost iconique",
    price: 99,
    collection: "boeing",
    inStock: true,
    image: `/images/boeing-737-ryannair.png`,
    images: [
      `/images/boeing-737-ryannair.png`,
      `/images/boeing-737-ryannair--3quarter-front.png`,
      `/images/boeing-737-ryannair--3quarter-rear.png`,
      `/images/boeing-737-ryannair--top.png`,
      `/images/boeing-737-ryannair--shelf.png`,
      `/images/boeing-737-ryannair--desk.png`,
    ],
    scale: "1/85",
  },
  {
    id: "b747-af",
    variantId: "53357386531156",
    handle: "maquette-avion-maquette-boeing-747",
    title: "Boeing 747 Air France",
    subtitle: "Le Jumbo Jet — livrée Air France",
    price: 99,
    collection: "boeing",
    inStock: true,
    image: `/images/maquette-avion-maquette-boeing-747.png`,
    images: [
      `/images/maquette-avion-maquette-boeing-747.png`,
      `/images/maquette-avion-maquette-boeing-747--3quarter-front.png`,
      `/images/maquette-avion-maquette-boeing-747--3quarter-rear.png`,
      `/images/maquette-avion-maquette-boeing-747--top.png`,
      `/images/maquette-avion-maquette-boeing-747--shelf.png`,
      `/images/maquette-avion-maquette-boeing-747--desk.png`,
    ],
    bestseller: true,
    scale: "1/150",
  },
  {
    id: "b747-afo",
    variantId: "0",
    handle: "boeing-747-air-force-one",
    title: "Boeing 747 Air Force One",
    subtitle: "L'avion présidentiel américain — livrée officielle",
    price: 99,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `/images/boeing-747-air-force-one.png`,
    images: [
      `/images/boeing-747-air-force-one.png`,
      `/images/boeing-747-air-force-one--3quarter-front.png`,
      `/images/boeing-747-air-force-one--top.png`,
      `/images/boeing-747-air-force-one--shelf.png`,
      `/images/boeing-747-air-force-one--desk.png`,
    ],
    scale: "1/150",
  },
  {
    id: "b777-af",
    variantId: "50833361797460",
    handle: "boeing-777",
    title: "Boeing 777 Air France",
    subtitle: "Long-courrier bi-réacteur — livrée Air France",
    price: 99,
    collection: "boeing",
    inStock: true,
    image: `/images/boeing-777.png`,
    images: [
      `/images/boeing-777.png`,
      `/images/boeing-777--3quarter-front.png`,
      `/images/boeing-777--3quarter-rear.png`,
      `/images/boeing-777--top.png`,
      `/images/boeing-777--shelf.png`,
      `/images/boeing-777--desk.png`,
    ],
    bestseller: false,
    scale: "1/157",
  },
  {
    id: "b777-qatar",
    variantId: "0",
    handle: "boeing-777-qatar",
    title: "Boeing 777 Qatar World",
    subtitle: "Long-courrier — livrée Qatar Airways World Cup",
    price: 99,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `/images/boeing-777-qatar.png`,
    images: [
      `/images/boeing-777-qatar.png`,
      `/images/boeing-777-qatar--3quarter-front.png`,
      `/images/boeing-777-qatar--3quarter-rear.png`,
      `/images/boeing-777-qatar--top.png`,
      `/images/boeing-777-qatar--shelf.png`,
      `/images/boeing-777-qatar--desk.png`,
    ],
    scale: "1/157",
  },
  {
    id: "b787-af",
    variantId: "50905378586964",
    handle: "boeing-787",
    title: "Boeing 787 Air France",
    subtitle: "Dreamliner nouvelle génération — livrée Air France",
    price: 99,
    collection: "boeing",
    inStock: true,
    image: `/images/boeing-787.png`,
    images: [
      `/images/boeing-787.png`,
      `/images/boeing-787--3quarter-front.png`,
      `/images/boeing-787--3quarter-rear.png`,
      `/images/boeing-787--top.png`,
      `/images/boeing-787--shelf.png`,
      `/images/boeing-787--desk.png`,
    ],
    bestseller: false,
    scale: "1/130",
  },
  {
    id: "b787-lufthansa",
    variantId: "0",
    handle: "boeing-787-lufthansa-100th",
    title: "Boeing 787 Lufthansa 100th",
    subtitle: "Dreamliner — édition 100 ans Lufthansa",
    price: 99,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `/images/boeing-787-lufthansa-100th.png`,
    images: [
      `/images/boeing-787-lufthansa-100th.png`,
      `/images/boeing-787-lufthansa-100th--3quarter-front.png`,
      `/images/boeing-787-lufthansa-100th--3quarter-rear.png`,
      `/images/boeing-787-lufthansa-100th--top.png`,
      `/images/boeing-787-lufthansa-100th--shelf.png`,
      `/images/boeing-787-lufthansa-100th--desk.png`,
    ],
    scale: "1/130",
  },
  {
    id: "b787-etihad",
    variantId: "0",
    handle: "boeing-787-etihad-manchester-city",
    title: "Boeing 787 Etihad Manchester City",
    subtitle: "Dreamliner — livrée Etihad × Manchester City",
    price: 99,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `/images/boeing-787-etihad-manchester-city.png`,
    images: [
      `/images/boeing-787-etihad-manchester-city.png`,
      `/images/boeing-787-etihad-manchester-city--3quarter-front.png`,
      `/images/boeing-787-etihad-manchester-city--3quarter-rear.png`,
      `/images/boeing-787-etihad-manchester-city--top.png`,
      `/images/boeing-787-etihad-manchester-city--shelf.png`,
      `/images/boeing-787-etihad-manchester-city--desk.png`,
    ],
    scale: "1/130",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // JET PRIVÉ
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "gulfstream-g650",
    variantId: "50905389334868",
    handle: "jet-prive",
    title: "Gulfstream G650",
    subtitle: "Jet d'affaires longue distance — finition premium",
    price: 99,
    collection: "jet",
    inStock: true,
    image: `/images/jet-prive.png`,
    images: [
      `/images/jet-prive.png`,
      `/images/jet-prive--3quarter-front.png`,
      `/images/jet-prive--3quarter-rear.png`,
      `/images/jet-prive--top.png`,
      `/images/jet-prive--shelf.png`,
      `/images/jet-prive--desk.png`,
    ],
    scale: "1/75",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CONCORDE
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "concorde-af-50",
    variantId: "50833485365588",
    handle: "concorde-airfrance",
    title: "Concorde 50 cm Air France",
    subtitle: "Supersonique légendaire — livrée Air France · 50 cm",
    price: 99,
    collection: "concorde",
    inStock: true,
    image: `/images/concorde-airfrance.png`,
    images: [
      `/images/concorde-airfrance.png`,
      `/images/concorde-airfrance--3quarter-front.png`,
      `/images/concorde-airfrance--3quarter-rear.png`,
      `/images/concorde-airfrance--top.png`,
      `/images/concorde-airfrance--shelf.png`,
      `/images/concorde-airfrance--desk.png`,
    ],
    scale: "1/125",
  },
  {
    id: "concorde-ba-50",
    variantId: "50833477108052",
    handle: "concorde-british",
    title: "Concorde 50 cm British Airways",
    subtitle: "Supersonique légendaire — livrée British Airways · 50 cm",
    price: 99,
    collection: "concorde",
    inStock: true,
    image: `/images/concorde-british.png`,
    images: [
      `/images/concorde-british.png`,
      `/images/concorde-british--3quarter-rear.png`,
      `/images/concorde-british--top.png`,
      `/images/concorde-british--shelf.png`,
      `/images/concorde-british--desk.png`,
    ],
    scale: "1/125",
  },
  {
    id: "concorde-af-30",
    variantId: "0",
    handle: "concorde-airfrance-30cm",
    title: "Concorde 1/200 Air France",
    subtitle: "Format compact 1/200 — livrée Air France",
    price: 59,
    collection: "concorde",
    inStock: true,
    comingSoon: false,
    image: `/images/concorde-airfrance-30cm.png`,
    images: [
      `/images/concorde-airfrance-30cm.png`,
      `/images/concorde-airfrance-30cm--3quarter-front.png`,
      `/images/concorde-airfrance-30cm--3quarter-rear.png`,
      `/images/concorde-airfrance-30cm--top.png`,
      `/images/concorde-airfrance-30cm--shelf.png`,
      `/images/concorde-airfrance-30cm--desk.png`,
    ],
    scale: "1/200",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PACKS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "pack-prestige-af",
    variantId: "53576782217556",
    handle: "pack-prestige-air-france",
    title: "Pack Prestige Air France",
    subtitle: "A380 + A350 + 777 — trois icônes Air France",
    price: 249,
    compareAt: 267,
    collection: "packs",
    inStock: true,
    image: `/images/pack-prestige-air-france.png`,
    images: [
      `/images/pack-prestige-air-france.png`,
      `/images/maquette-avion-maquette-airbus-a380--3quarter-front.png`,
      `/images/maquette-avion-maquette-airbus-a380--desk.png`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--3quarter-front.png`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--desk.png`,
      `/images/boeing-777--3quarter-front.png`,
      `/images/boeing-777--desk.png`,
    ],
    bestseller: true,
  },
  {
    id: "pack-airbus",
    variantId: "53577728786772",
    handle: "pack-trio-airbus-premium-a320-a350-a380",
    title: "Pack Collection Airbus",
    subtitle: "A320 + A350 + A380 — la flotte Airbus réunie",
    price: 249,
    compareAt: 267,
    collection: "packs",
    inStock: true,
    image: `/images/pack-trio-airbus-premium-a320-a350-a380.png`,
    images: [
      `/images/pack-trio-airbus-premium-a320-a350-a380.png`,
      `/images/a320-neo--3quarter-front.png`,
      `/images/a320-neo--desk.png`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--3quarter-front.png`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--desk.png`,
      `/images/maquette-avion-maquette-airbus-a380--3quarter-front.png`,
      `/images/maquette-avion-maquette-airbus-a380--desk.png`,
    ],
  },
  {
    id: "pack-boeing",
    variantId: "53577463529812",
    handle: "pack-collection-boeing",
    title: "Pack Collection Boeing",
    subtitle: "747 + 777 + 787 — la flotte Boeing réunie",
    price: 249,
    compareAt: 267,
    collection: "packs",
    inStock: true,
    image: `/images/pack-collection-boeing.png`,
    images: [
      `/images/pack-collection-boeing.png`,
      `/images/boeing-787--3quarter-front.png`,
      `/images/boeing-787--desk.png`,
      `/images/maquette-avion-maquette-boeing-747--3quarter-front.png`,
      `/images/maquette-avion-maquette-boeing-747--desk.png`,
      `/images/boeing-777--3quarter-front.png`,
      `/images/boeing-777--desk.png`,
    ],
  },
  {
    id: "pack-duo",
    variantId: "53575762608468",
    handle: "pack-duo",
    title: "Pack Duo Airbus & Boeing",
    subtitle: "Un Airbus + Un Boeing — offre idéale duo",
    price: 149,
    compareAt: 178,
    collection: "packs",
    inStock: true,
    image: `/images/pack-duo.png`,
    images: [
      `/images/pack-duo.png`,
      `/images/a320-neo--3quarter-front.png`,
      `/images/a320-neo--desk.png`,
      `/images/boeing-777--3quarter-front.png`,
      `/images/boeing-777--desk.png`,
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ACCESSOIRES
  // ══════════════════════════════════════════════════════════════════════════

  // ── Porte-clé AirplaneStore · 1 produit, 8 designs au choix · 4,90 € ──
  // The customer picks a design from the variant chip selector on the
  // PDP. The first variant uses the existing Shopify variantId; the 7
  // others stay at "0" until /admin/setup-keychain-variants is run
  // against a Shopify Admin token that has write_products scope.
  {
    id: "portecle-airplanestore",
    variantId: "53842722357588",  // default (SkyTeam) — overridden when a variant is picked
    handle: "accessoires-aviation-en-metal",
    title: "Porte-clé AirplaneStore",
    subtitle: "Tissu brodé · 8 designs au choix",
    price: 4.9,
    collection: "accessoires",
    inStock: true,
    image: `/images/porte-cle-air-france-lhr.png`,
    images: [
      `/images/porte-cle-air-france-lhr.png`,
      `/images/porte-cle-remove-before-flight.png`,
      `/images/porte-cle-air-france-navy.png`,
      `/images/porte-cle-air-france-rouge-navy.png`,
      `/images/porte-cle-captain.png`,
      `/images/porte-cle-pilot.png`,
      `/images/porte-cle-silhouette-avion-1.png`,
      `/images/porte-cle-silhouette-avion-2.png`,
    ],
    // Until real Shopify variants are created (via /admin/setup-keychain-variants
    // once SHOPIFY_ADMIN_TOKEN is set), all 8 designs point to the existing
    // variant 53842722357588. Orders will all land as the same SKU on Shopify
    // — fulfilment must read the cart line label ("Porte-clé AirplaneStore ·
    // CAPTAIN" etc.) to pick the right embroidered design.
    variants: [
      { id: "53842722357588", label: "AIR FRANCE SkyTeam",      image: "/images/porte-cle-air-france-lhr.png" },
      { id: "53842722357588", label: "REMOVE BEFORE FLIGHT",     image: "/images/porte-cle-remove-before-flight.png" },
      { id: "53842722357588", label: "AIR FRANCE Navy",          image: "/images/porte-cle-air-france-navy.png" },
      { id: "53842722357588", label: "AIR FRANCE Rouge & Navy",  image: "/images/porte-cle-air-france-rouge-navy.png" },
      { id: "53842722357588", label: "CAPTAIN",                  image: "/images/porte-cle-captain.png" },
      { id: "53842722357588", label: "PILOT",                    image: "/images/porte-cle-pilot.png" },
      { id: "53842722357588", label: "Silhouette Avion",         image: "/images/porte-cle-silhouette-avion-1.png" },
      { id: "53842722357588", label: "Silhouette Constellation", image: "/images/porte-cle-silhouette-avion-2.png" },
    ],
  },
  {
    id: "horloge-turbine",
    variantId: "53842911625556",
    handle: "flamme-en-tissu-brode",
    title: "Accessoires Aviation en Métal",
    subtitle: "Collection métal brossé — décoration aéronautique",
    price: 14.9,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/IMG-7037_nobg.png`,
  },
  {
    id: "horloge-murale",
    variantId: "50833535271252",
    handle: "horloge-mural",
    title: "Horloge Murale Aéronautique",
    subtitle: "Décoration murale — design réacteur",
    price: 15.9,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/AD184BA4-005E-4FB9-B9FC-0A8B97709210_nobg_v2.png`,
  },
  {
    id: "gravure",
    variantId: "53749941698900",
    handle: "gravure-personnalisee",
    title: "Gravure personnalisée",
    subtitle: "Nom, date ou immatriculation sur le socle",
    price: 15,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/IMG-7011_nobg.png`,
  },
];

export function formatPrice(n: number): string {
  const isWhole = n % 1 === 0;
  const str = isWhole ? `${n}` : n.toFixed(2).replace(".", ",");
  return `${str}€`;
}

export function byCollection(slug: Collection): Product[] {
  return PRODUCTS.filter((p) => p.collection === slug);
}

export function getProduct(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function related(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.collection === product.collection && p.id !== product.id && p.inStock,
  ).slice(0, limit);
}

export function sortForDisplay(items: Product[]): Product[] {
  return [...items].sort((a, b) => {
    if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
    if (a.bestseller !== b.bestseller) return a.bestseller ? -1 : 1;
    return 0;
  });
}
