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
  // "chasse" (Aviation militaire) réactivée 27/07/2026 après découverte que
  // Shopify a en fait 3 produits en stock : Rafale (50833505026388),
  // Mirage 2000 (50833498702164), F16 (50833491722580).
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
    image: `/images/airbus-a220-air-france.webp`,
    images: [
      `/images/airbus-a220-air-france.webp`,
      `/images/airbus-a220-air-france--3quarter-front.webp`,
      `/images/airbus-a220-air-france--3quarter-rear.webp`,
      `/images/airbus-a220-air-france--top.webp`,
      `/images/airbus-a220-air-france--shelf.webp`,
      `/images/airbus-a220-air-france--desk.webp`,
    ],
    bestseller: false,
    scale: "1/100",
  },
  {
    // Discontinué sur Shopify (variantId invalide). Gardé pour SEO/redirects
    // mais bloqué en achat. Si le client relance ce modèle, mettre à jour
    // variantId + inStock. Cf. sync stock live: si Shopify réinstalle un
    // variant à cet id, applyShopifyInventory bascule inStock automatiquement.
    id: "a320-af",
    variantId: "53357075595604",
    handle: "a320-neo",
    title: "Airbus A320 Néo Air France",
    subtitle: "Moyen-courrier de référence — livrée Air France · A320 Néo",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/a320-neo.webp`,
    images: [
      `/images/a320-neo.webp`,
      `/images/a320-neo--3quarter-front.webp`,
      `/images/a320-neo--3quarter-rear.webp`,
      `/images/a320-neo--top.webp`,
      `/images/a320-neo--shelf.webp`,
      `/images/a320-neo--desk.webp`,
    ],
    // Bestseller sélectionné par le client (feedback 27/07/2026)
    bestseller: true,
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
    image: `/images/airbus-a320-echelle-1-85-finition-premium.webp`,
    images: [
      `/images/airbus-a320-echelle-1-85-finition-premium.webp`,
      `/images/airbus-a320-echelle-1-85-finition-premium--3quarter-front.webp`,
      `/images/airbus-a320-echelle-1-85-finition-premium--3quarter-rear.webp`,
      `/images/airbus-a320-echelle-1-85-finition-premium--top.webp`,
      `/images/airbus-a320-echelle-1-85-finition-premium--shelf.webp`,
      `/images/airbus-a320-echelle-1-85-finition-premium--desk.webp`,
    ],
    scale: "1/85",
  },
  {
    id: "a320-neo-transavia",
    variantId: "56573671244116",
    handle: "airbus-a320-neo-transavia",
    title: "Airbus A320 Néo Transavia",
    subtitle: "Livrée Transavia — A320 Néo, échelle 1/100",
    price: 99,
    collection: "airbus",
    // Stock à jour 27/07/2026 (feedback client) : 20 unités disponibles.
    inStock: true,
    image: `/images/airbus-a320-neo-transavia.webp`,
    images: [
      `/images/airbus-a320-neo-transavia.webp`,
      `/images/airbus-a320-neo-transavia--3quarter-front.webp`,
      `/images/airbus-a320-neo-transavia--3quarter-rear.webp`,
      `/images/airbus-a320-neo-transavia--top.webp`,
      `/images/airbus-a320-neo-transavia--shelf.webp`,
      `/images/airbus-a320-neo-transavia--desk.webp`,
    ],
    // Bestseller sélectionné par le client (feedback 27/07/2026)
    bestseller: true,
    scale: "1/100",
  },
  {
    id: "a320-qatar-psg",
    variantId: "56057708577108",
    handle: "copie-airbus-a320-echelle-1-85-finition-premium",
    title: "Airbus A320 Qatar PSG Livery",
    subtitle: "Livrée sponsor — édition Paris Saint-Germain",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/copie-airbus-a320-echelle-1-85-finition-premium.webp`,
    images: [
      `/images/copie-airbus-a320-echelle-1-85-finition-premium.webp`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--3quarter-front.webp`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--3quarter-rear.webp`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--top.webp`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--shelf.webp`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--desk.webp`,
    ],
    scale: "1/85",
  },
  {
    id: "a321-af",
    variantId: "56057898434900",
    handle: "a-321",
    title: "Airbus A321 Air France",
    subtitle: "Version allongée — livrée Air France",
    price: 99,
    collection: "airbus",
    // Épuisé 27/07/2026 (dernier vendu — feedback client)
    inStock: false,
    image: `/images/a-321.webp`,
    images: [
      `/images/a-321.webp`,
      `/images/a-321--3quarter-front.webp`,
      `/images/a-321--3quarter-rear.webp`,
      `/images/a-321--top.webp`,
      `/images/a-321--shelf.webp`,
      `/images/a-321--desk.webp`,
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
    // Épuisé 27/07/2026 (dernier vendu — feedback client)
    inStock: false,
    image: `/images/airbus-a321-easyjet.webp`,
    images: [
      `/images/airbus-a321-easyjet.webp`,
      `/images/airbus-a321-easyjet--3quarter-front.webp`,
      `/images/airbus-a321-easyjet--3quarter-rear.webp`,
      `/images/airbus-a321-easyjet--top.webp`,
      `/images/airbus-a321-easyjet--shelf.webp`,
      `/images/airbus-a321-easyjet--desk.webp`,
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
    image: `/images/maquette-avion-maquette-airbus-a350-airfrance.webp`,
    images: [
      `/images/maquette-avion-maquette-airbus-a350-airfrance.webp`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--3quarter-front.webp`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--shelf.webp`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--desk.webp`,
    ],
    bestseller: false,
    scale: "1/142",
  },
  {
    id: "a350-singapore",
    variantId: "51611732148564",
    handle: "airbus-a350-singapore",
    title: "Airbus A350 Singapore Airlines",
    subtitle: "Long-courrier — livrée Singapore Airlines",
    price: 99,
    collection: "airbus",
    // Stock 5 unités au 27/07/2026 (feedback client)
    inStock: true,
    image: `/images/airbus-a350-singapore.webp`,
    images: [
      `/images/airbus-a350-singapore.webp`,
      `/images/airbus-a350-singapore--3quarter-rear.webp`,
      `/images/airbus-a350-singapore--top.webp`,
      `/images/airbus-a350-singapore--shelf.webp`,
      `/images/airbus-a350-singapore--desk.webp`,
    ],
    scale: "1/142",
  },
  {
    id: "a350-iberia",
    variantId: "53472718487892",
    handle: "airbus-a350-iberia",
    title: "Airbus A350 Iberia",
    subtitle: "Long-courrier — livrée Iberia",
    price: 99,
    collection: "airbus",
    // Stock 2 unités au 27/07/2026 (feedback client)
    inStock: true,
    image: `/images/airbus-a350-iberia.webp`,
    images: [
      `/images/airbus-a350-iberia.webp`,
      `/images/airbus-a350-iberia--3quarter-front.webp`,
      `/images/airbus-a350-iberia--3quarter-rear.webp`,
      `/images/airbus-a350-iberia--top.webp`,
      `/images/airbus-a350-iberia--shelf.webp`,
      `/images/airbus-a350-iberia--desk.webp`,
    ],
    scale: "1/142",
  },
  {
    id: "a350-emirates",
    variantId: "50905226445140",
    handle: "airbus-a350-emirates",
    title: "Airbus A350 Emirates",
    subtitle: "Long-courrier — livrée Emirates",
    price: 99,
    collection: "airbus",
    // Stock 5 unités au 27/07/2026 (feedback client)
    inStock: true,
    image: `/images/airbus-a350-emirates.webp`,
    images: [
      `/images/airbus-a350-emirates.webp`,
      `/images/airbus-a350-emirates--3quarter-front.webp`,
      `/images/airbus-a350-emirates--3quarter-rear.webp`,
      `/images/airbus-a350-emirates--top.webp`,
      `/images/airbus-a350-emirates--shelf.webp`,
      `/images/airbus-a350-emirates--desk.webp`,
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
    image: `/images/maquette-avion-maquette-airbus-a380.webp`,
    images: [
      `/images/maquette-avion-maquette-airbus-a380.webp`,
      `/images/maquette-avion-maquette-airbus-a380--3quarter-front.webp`,
      `/images/maquette-avion-maquette-airbus-a380--3quarter-rear.webp`,
      `/images/maquette-avion-maquette-airbus-a380--top.webp`,
      `/images/maquette-avion-maquette-airbus-a380--shelf.webp`,
      `/images/maquette-avion-maquette-airbus-a380--desk.webp`,
    ],
    bestseller: true,
    scale: "1/160",
  },
  {
    id: "a380-singapore",
    variantId: "50905268814164",
    handle: "airbus-a380-singapore",
    title: "Airbus A380 Singapore Airlines",
    subtitle: "Géant des airs — livrée Singapore Airlines",
    price: 99,
    collection: "airbus",
    // Stock 4 unités au 27/07/2026 (feedback client)
    inStock: true,
    image: `/images/airbus-a380-singapore.webp`,
    images: [
      `/images/airbus-a380-singapore.webp`,
      `/images/airbus-a380-singapore--3quarter-front.webp`,
      `/images/airbus-a380-singapore--3quarter-rear.webp`,
      `/images/airbus-a380-singapore--top.webp`,
      `/images/airbus-a380-singapore--shelf.webp`,
      `/images/airbus-a380-singapore--desk.webp`,
    ],
    scale: "1/160",
  },
  {
    id: "a380-emirates",
    variantId: "50904689606996",
    handle: "airbus-a380-emirates",
    title: "Airbus A380 Emirates",
    subtitle: "Géant des airs — livrée Emirates",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/airbus-a380-emirates.webp`,
    images: [
      `/images/airbus-a380-emirates.webp`,
      `/images/airbus-a380-emirates--3quarter-front.webp`,
      `/images/airbus-a380-emirates--3quarter-rear.webp`,
      `/images/airbus-a380-emirates--top.webp`,
      `/images/airbus-a380-emirates--shelf.webp`,
      `/images/airbus-a380-emirates--desk.webp`,
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
    image: `/images/boeing-737-ryannair.webp`,
    images: [
      `/images/boeing-737-ryannair.webp`,
      `/images/boeing-737-ryannair--3quarter-front.webp`,
      `/images/boeing-737-ryannair--3quarter-rear.webp`,
      `/images/boeing-737-ryannair--top.webp`,
      `/images/boeing-737-ryannair--shelf.webp`,
      `/images/boeing-737-ryannair--desk.webp`,
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
    // Épuisé 27/07/2026 (feedback client — pas en stock)
    inStock: false,
    image: `/images/maquette-avion-maquette-boeing-747.webp`,
    images: [
      `/images/maquette-avion-maquette-boeing-747.webp`,
      `/images/maquette-avion-maquette-boeing-747--3quarter-front.webp`,
      `/images/maquette-avion-maquette-boeing-747--3quarter-rear.webp`,
      `/images/maquette-avion-maquette-boeing-747--top.webp`,
      `/images/maquette-avion-maquette-boeing-747--shelf.webp`,
      `/images/maquette-avion-maquette-boeing-747--desk.webp`,
    ],
    // Retiré des bestsellers 27/07/2026 — épuisé
    bestseller: false,
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
    image: `/images/boeing-747-air-force-one.webp`,
    images: [
      `/images/boeing-747-air-force-one.webp`,
      `/images/boeing-747-air-force-one--3quarter-front.webp`,
      `/images/boeing-747-air-force-one--top.webp`,
      `/images/boeing-747-air-force-one--shelf.webp`,
      `/images/boeing-747-air-force-one--desk.webp`,
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
    // Épuisé 27/07/2026 (dernier vendu — feedback client)
    inStock: false,
    image: `/images/boeing-777.webp`,
    images: [
      `/images/boeing-777.webp`,
      `/images/boeing-777--3quarter-front.webp`,
      `/images/boeing-777--3quarter-rear.webp`,
      `/images/boeing-777--top.webp`,
      `/images/boeing-777--shelf.webp`,
      `/images/boeing-777--desk.webp`,
    ],
    bestseller: false,
    scale: "1/157",
  },
  {
    id: "b777-qatar",
    variantId: "50905358336340",
    handle: "boeing-777-qatar",
    title: "Boeing 777 Qatar World",
    subtitle: "Long-courrier — livrée Qatar Airways World Cup",
    price: 99,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `/images/boeing-777-qatar.webp`,
    images: [
      `/images/boeing-777-qatar.webp`,
      `/images/boeing-777-qatar--3quarter-front.webp`,
      `/images/boeing-777-qatar--3quarter-rear.webp`,
      `/images/boeing-777-qatar--top.webp`,
      `/images/boeing-777-qatar--shelf.webp`,
      `/images/boeing-777-qatar--desk.webp`,
    ],
    scale: "1/157",
  },
  {
    id: "b787-af",
    variantId: "52227315794260",
    handle: "boeing-787",
    title: "Boeing 787 Air France",
    subtitle: "Dreamliner nouvelle génération — livrée Air France",
    price: 99,
    collection: "boeing",
    inStock: true,
    image: `/images/boeing-787.webp`,
    images: [
      `/images/boeing-787.webp`,
      `/images/boeing-787--3quarter-front.webp`,
      `/images/boeing-787--3quarter-rear.webp`,
      `/images/boeing-787--top.webp`,
      `/images/boeing-787--shelf.webp`,
      `/images/boeing-787--desk.webp`,
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
    image: `/images/boeing-787-lufthansa-100th.webp`,
    images: [
      `/images/boeing-787-lufthansa-100th.webp`,
      `/images/boeing-787-lufthansa-100th--3quarter-front.webp`,
      `/images/boeing-787-lufthansa-100th--3quarter-rear.webp`,
      `/images/boeing-787-lufthansa-100th--top.webp`,
      `/images/boeing-787-lufthansa-100th--shelf.webp`,
      `/images/boeing-787-lufthansa-100th--desk.webp`,
    ],
    scale: "1/130",
  },
  {
    id: "b787-etihad",
    variantId: "52227315827028",
    handle: "boeing-787-etihad-manchester-city",
    title: "Boeing 787 Etihad Manchester City",
    subtitle: "Dreamliner — livrée Etihad × Manchester City",
    price: 99,
    collection: "boeing",
    inStock: true,
    image: `/images/boeing-787-etihad-manchester-city.webp`,
    images: [
      `/images/boeing-787-etihad-manchester-city.webp`,
      `/images/boeing-787-etihad-manchester-city--3quarter-front.webp`,
      `/images/boeing-787-etihad-manchester-city--3quarter-rear.webp`,
      `/images/boeing-787-etihad-manchester-city--top.webp`,
      `/images/boeing-787-etihad-manchester-city--shelf.webp`,
      `/images/boeing-787-etihad-manchester-city--desk.webp`,
    ],
    scale: "1/130",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // AVIATION MILITAIRE (chasse)
  // ══════════════════════════════════════════════════════════════════════════
  // Ajoutés 27/07/2026 — variantIds récupérés depuis Shopify (products.json).
  // Photos placeholder tant que le client n'a pas envoyé ses vraies photos.

  {
    id: "rafale-dassault",
    variantId: "50833505026388",
    handle: "rafale-dassault",
    title: "Rafale Dassault",
    subtitle: "Avion de chasse français — livrée Armée de l'Air",
    price: 99,
    collection: "chasse",
    inStock: true,
    image: `/images/rafale-dassault.webp`,
    scale: "1/72",
  },
  {
    id: "mirage-2000",
    variantId: "50833498702164",
    handle: "mirage-2000",
    title: "Mirage 2000",
    subtitle: "Chasseur multirôle Dassault — Armée de l'Air française",
    price: 99,
    collection: "chasse",
    inStock: true,
    image: `/images/mirage-2000.webp`,
    scale: "1/100",
  },
  {
    id: "f16",
    variantId: "50833491722580",
    handle: "f16",
    title: "F-16 Fighting Falcon",
    subtitle: "Chasseur monoréacteur — livrée américaine",
    price: 99,
    collection: "chasse",
    inStock: true,
    image: `/images/f16.webp`,
    scale: "1/100",
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
    image: `/images/jet-prive.webp`,
    images: [
      `/images/jet-prive.webp`,
      `/images/jet-prive--3quarter-front.webp`,
      `/images/jet-prive--3quarter-rear.webp`,
      `/images/jet-prive--top.webp`,
      `/images/jet-prive--shelf.webp`,
      `/images/jet-prive--desk.webp`,
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
    image: `/images/concorde-airfrance.webp`,
    images: [
      `/images/concorde-airfrance.webp`,
      `/images/concorde-airfrance--3quarter-front.webp`,
      `/images/concorde-airfrance--3quarter-rear.webp`,
      `/images/concorde-airfrance--top.webp`,
      `/images/concorde-airfrance--shelf.webp`,
      `/images/concorde-airfrance--desk.webp`,
    ],
    // Bestseller sélectionné par le client (feedback 27/07/2026)
    bestseller: true,
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
    image: `/images/concorde-british.webp`,
    images: [
      `/images/concorde-british.webp`,
      `/images/concorde-british--3quarter-rear.webp`,
      `/images/concorde-british--top.webp`,
      `/images/concorde-british--shelf.webp`,
      `/images/concorde-british--desk.webp`,
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
    image: `/images/concorde-airfrance-30cm.webp`,
    images: [
      `/images/concorde-airfrance-30cm.webp`,
      `/images/concorde-airfrance-30cm--3quarter-front.webp`,
      `/images/concorde-airfrance-30cm--3quarter-rear.webp`,
      `/images/concorde-airfrance-30cm--top.webp`,
      `/images/concorde-airfrance-30cm--shelf.webp`,
      `/images/concorde-airfrance-30cm--desk.webp`,
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
    image: `/images/pack-prestige-air-france.webp`,
    images: [
      `/images/pack-prestige-air-france.webp`,
      `/images/maquette-avion-maquette-airbus-a380--3quarter-front.webp`,
      `/images/maquette-avion-maquette-airbus-a380--desk.webp`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--3quarter-front.webp`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--desk.webp`,
      `/images/boeing-777--3quarter-front.webp`,
      `/images/boeing-777--desk.webp`,
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
    image: `/images/pack-trio-airbus-premium-a320-a350-a380.webp`,
    images: [
      `/images/pack-trio-airbus-premium-a320-a350-a380.webp`,
      `/images/a320-neo--3quarter-front.webp`,
      `/images/a320-neo--desk.webp`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--3quarter-front.webp`,
      `/images/maquette-avion-maquette-airbus-a350-airfrance--desk.webp`,
      `/images/maquette-avion-maquette-airbus-a380--3quarter-front.webp`,
      `/images/maquette-avion-maquette-airbus-a380--desk.webp`,
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
    image: `/images/pack-collection-boeing.webp`,
    images: [
      `/images/pack-collection-boeing.webp`,
      `/images/boeing-787--3quarter-front.webp`,
      `/images/boeing-787--desk.webp`,
      `/images/maquette-avion-maquette-boeing-747--3quarter-front.webp`,
      `/images/maquette-avion-maquette-boeing-747--desk.webp`,
      `/images/boeing-777--3quarter-front.webp`,
      `/images/boeing-777--desk.webp`,
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
    image: `/images/pack-duo.webp`,
    images: [
      `/images/pack-duo.webp`,
      `/images/a320-neo--3quarter-front.webp`,
      `/images/a320-neo--desk.webp`,
      `/images/boeing-777--3quarter-front.webp`,
      `/images/boeing-777--desk.webp`,
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
    title: "Porte-clé personnalisé",
    subtitle: "Tissu brodé · 8 designs au choix (Air France, Pilote, Captain…)",
    price: 4.9,
    collection: "accessoires",
    inStock: true,
    image: `/images/porte-cle-air-france-lhr.webp`,
    images: [
      `/images/porte-cle-air-france-lhr.webp`,
      `/images/porte-cle-remove-before-flight.webp`,
      `/images/porte-cle-air-france-navy.webp`,
      `/images/porte-cle-air-france-rouge-navy.webp`,
      `/images/porte-cle-captain.webp`,
      `/images/porte-cle-pilot.webp`,
      `/images/porte-cle-silhouette-avion-1.webp`,
      `/images/porte-cle-silhouette-avion-2.webp`,
    ],
    // Until real Shopify variants are created (via /admin/setup-keychain-variants
    // once SHOPIFY_ADMIN_TOKEN is set), all 8 designs point to the existing
    // variant 53842722357588. Orders will all land as the same SKU on Shopify
    // — fulfilment must read the cart line label ("Porte-clé AirplaneStore ·
    // CAPTAIN" etc.) to pick the right embroidered design.
    variants: [
      { id: "53842722357588", label: "AIR FRANCE SkyTeam",      image: "/images/porte-cle-air-france-lhr.webp" },
      { id: "53842722357588", label: "REMOVE BEFORE FLIGHT",     image: "/images/porte-cle-remove-before-flight.webp" },
      { id: "53842722357588", label: "AIR FRANCE Navy",          image: "/images/porte-cle-air-france-navy.webp" },
      { id: "53842722357588", label: "AIR FRANCE Rouge & Navy",  image: "/images/porte-cle-air-france-rouge-navy.webp" },
      { id: "53842722357588", label: "CAPTAIN",                  image: "/images/porte-cle-captain.webp" },
      { id: "53842722357588", label: "PILOT",                    image: "/images/porte-cle-pilot.webp" },
      { id: "53842722357588", label: "Silhouette Avion",         image: "/images/porte-cle-silhouette-avion-1.webp" },
      { id: "53842722357588", label: "Silhouette Constellation", image: "/images/porte-cle-silhouette-avion-2.webp" },
    ],
  },
  // ── Horloge Turbine Aviation ─────────────────────────────────────────
  // The metal AF keychain that used to share this image lump on Shopify
  // has no public variant to ship against — listing dropped. The clock
  // stays as a standalone product mapped to the real Shopify product
  // "Horloge Murale" (50833535271252).
  {
    id: "horloge-turbine",
    variantId: "50833535271252",
    handle: "horloge-mural",
    title: "Horloge Turbine Aviation",
    subtitle: "Réplique de réacteur · cadran lumineux phosphorescent",
    price: 15.9,
    collection: "accessoires",
    inStock: true,
    image: `/images/accessoire-horloge-turbine.webp`,
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
    image: `/images/gravure-personnalisee.webp`,
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
