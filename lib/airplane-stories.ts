/**
 * Editorial content displayed on each product page below the main fiche.
 *
 * Data is split in two layers so we don't repeat ourselves across liveries:
 *  - AIRPLANE_STORIES: shared per **model** (the A380 story is the same
 *    whether you bought the Air France or Emirates livery).
 *  - LIVERY_NOTES: a short per-**product handle** paragraph layered on top
 *    of the model story (talks about the airline's history with that plane).
 *
 * Use getStory(handle) to fetch the merged story for a product.
 */

export type AirplaneStory = {
  intro: string[];                                  // paragraphs (2)
  timeline: { year: string; event: string }[];      // 4-6 entries
  specs: {
    capacity: string;
    range: string;
    length: string;
    cruise: string;
  };
  airlines: string[];                               // notable operators
  funFact: { title: string; body: string };
};

export type LiveryNote = {
  paragraph: string;                                // ~80 words
};

// ─────────────────────────────────────────────────────────────────────────
// Model stories — shared across liveries of the same airframe
// ─────────────────────────────────────────────────────────────────────────

export const AIRPLANE_STORIES: Record<string, AirplaneStory> = {
  a380: {
    intro: [
      "Lancé en 2000 et entré en service commercial en 2007, l'Airbus A380 est le plus grand avion de ligne jamais construit. Surnommé le « Superjumbo », il a redéfini le voyage long-courrier pendant plus d'une décennie avec ses deux ponts complets, sa silhouette massive et son silence en cabine remarquable.",
      "Symbole d'un âge d'or de l'aviation civile, l'A380 a permis aux grandes compagnies d'absorber des flux de passagers records sur leurs hubs les plus chargés. Son arrêt de production en 2021 marque la fin d'une époque — celle des quadriréacteurs géants — au profit des bimoteurs long-courriers plus économiques.",
    ],
    timeline: [
      { year: "2000", event: "Lancement officiel du programme à Toulouse" },
      { year: "2005", event: "Premier vol depuis Toulouse-Blagnac" },
      { year: "2007", event: "Mise en service par Singapore Airlines" },
      { year: "2017", event: "Airbus annonce la fin de production" },
      { year: "2021", event: "Dernier exemplaire livré à Emirates" },
    ],
    specs: {
      capacity: "525 pax",
      range: "14 800 km",
      length: "72,7 m",
      cruise: "Mach 0,85",
    },
    airlines: [
      "Emirates",
      "Singapore Airlines",
      "Qantas",
      "British Airways",
      "Lufthansa",
      "Air France",
      "Korean Air",
      "Etihad",
      "Qatar Airways",
      "Asiana",
    ],
    funFact: {
      title: "L'équivalent de trois courts de tennis",
      body: "Avec 845 m² de surface alaire, 22 roues sur son train d'atterrissage et plus de 4 millions de pièces, l'A380 peut décoller à une masse maximale de 575 tonnes — soit l'équivalent de 380 voitures.",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Per-handle livery notes
// ─────────────────────────────────────────────────────────────────────────

type LiveryEntry = { model: keyof typeof AIRPLANE_STORIES; livery: LiveryNote };

export const LIVERY_NOTES: Record<string, LiveryEntry> = {
  "maquette-avion-maquette-airbus-a380": {
    model: "a380",
    livery: {
      paragraph:
        "Air France a opéré 10 Airbus A380 entre 2009 et 2020, immatriculés F-HPJA à F-HPJJ. Affecté à ses routes les plus prestigieuses — Paris-New York, Los Angeles, Mexico, Johannesburg, Shanghai — le Superjumbo de la compagnie tricolore arborait son drapeau caractéristique sur la dérive et accueillait 516 sièges en 4 classes. La flotte a été retirée prématurément en mai 2020, marquant la fin d'une époque pour Air France.",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────────────────

export function getStory(handle: string):
  | { model: AirplaneStory; livery: LiveryNote }
  | null {
  const entry = LIVERY_NOTES[handle];
  if (!entry) return null;
  const model = AIRPLANE_STORIES[entry.model];
  if (!model) return null;
  return { model, livery: entry.livery };
}
