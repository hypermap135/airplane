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
  heading: string;                                  // editorial h2, per model
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
  // ── AIRBUS ──
  a220: {
    heading: "Le petit dernier d'Airbus.",
    intro: [
      "Né sous le nom de Bombardier CSeries au Canada, l'Airbus A220 a rejoint le constructeur européen en 2018. Conçu pour les courts et moyens-courriers, c'est l'un des avions monocouloirs les plus modernes du marché — moteurs Pratt & Whitney PW1500G à réducteur, cabine spacieuse, hublots surdimensionnés.",
      "Sa cabine 2+3 supprime le siège du milieu honni des voyageurs et son niveau sonore est inférieur de 20% à celui de ses concurrents. L'A220 a redéfini les standards de confort en aviation court-courrier, et séduit autant les low-cost que les compagnies nationales.",
    ],
    timeline: [
      { year: "2008", event: "Lancement du programme Bombardier CSeries" },
      { year: "2013", event: "Premier vol depuis Mirabel (Canada)" },
      { year: "2016", event: "Mise en service par Swiss" },
      { year: "2018", event: "Rachat du programme par Airbus — devient l'A220" },
      { year: "2021", event: "Entrée en service chez Air France" },
    ],
    specs: { capacity: "130-160 pax", range: "6 300 km", length: "38,7 m", cruise: "Mach 0,78" },
    airlines: ["Swiss", "airBaltic", "Delta", "Air France", "JetBlue", "Korean Air", "ITA Airways", "Breeze"],
    funFact: {
      title: "Les plus grands hublots de sa catégorie",
      body: "L'A220 dispose des hublots les plus grands de sa catégorie — 28% plus larges que ceux d'un A320 classique — et sa cabine est 20% plus silencieuse en croisière grâce à ses moteurs à réducteur et son insonorisation renforcée.",
    },
  },

  a320: {
    heading: "L'avion le plus produit de l'histoire.",
    intro: [
      "L'Airbus A320 est l'avion de ligne monocouloir le plus produit de l'histoire, avec plus de 11 000 exemplaires livrés. Lancé à la fin des années 80, il a été le premier avion commercial à utiliser des commandes de vol entièrement électriques (fly-by-wire) sans liaison mécanique entre le manche et les gouvernes.",
      "Depuis 2016, sa version A320neo (New Engine Option) équipée de moteurs CFM LEAP ou Pratt & Whitney GTF réduit la consommation de carburant de 15 à 20%. Backbone des compagnies low-cost comme des majors, l'A320 dessert chaque coin du globe — d'Europe vers le Maghreb, d'Asie en intra-régional, d'Amérique transcontinentalement.",
    ],
    timeline: [
      { year: "1984", event: "Lancement officiel du programme" },
      { year: "1987", event: "Premier vol depuis Toulouse" },
      { year: "1988", event: "Mise en service chez Air France (client de lancement)" },
      { year: "2010", event: "Lancement de l'A320neo" },
      { year: "2016", event: "Mise en service A320neo (Lufthansa)" },
    ],
    specs: { capacity: "150-186 pax", range: "6 300 km", length: "37,6 m", cruise: "Mach 0,78" },
    airlines: ["Air France", "EasyJet", "IndiGo", "Wizz Air", "Lufthansa", "Delta", "American", "JetBlue", "AirAsia", "Avianca"],
    funFact: {
      title: "Premier avion commercial fly-by-wire",
      body: "L'A320 a inauguré en 1988 le pilotage entièrement électrique : aucune liaison mécanique entre les manches latéraux (sidesticks) et les gouvernes. Une révolution qui équipe désormais tous les avions Airbus et la majorité des Boeing récents.",
    },
  },

  a321: {
    heading: "Le bras armé transatlantique.",
    intro: [
      "L'Airbus A321 est la version allongée de l'A320 — fuselage rallongé de près de 7 mètres pour accueillir jusqu'à 244 passagers. Très prisé sur les lignes européennes à fort trafic, il s'impose progressivement sur les routes transatlantiques grâce à sa version XLR (Xtra Long Range) lancée en 2024.",
      "Avec son A321XLR capable de relier New York à Rome ou Tokyo à Sydney sans escale, Airbus enfonce un clou dans le cercueil du Boeing 757 et ouvre une nouvelle ère : celle du transatlantique en monocouloir, plus rentable pour les compagnies que les gros wide-body sur les lignes secondaires.",
    ],
    timeline: [
      { year: "1989", event: "Lancement du programme A321" },
      { year: "1993", event: "Premier vol" },
      { year: "1994", event: "Mise en service chez Lufthansa" },
      { year: "2016", event: "Mise en service A321neo" },
      { year: "2024", event: "Mise en service A321XLR (Iberia)" },
    ],
    specs: { capacity: "220-244 pax", range: "8 700 km (XLR)", length: "44,5 m", cruise: "Mach 0,78" },
    airlines: ["American", "Delta", "Lufthansa", "Air France", "Iberia", "JetBlue", "Wizz Air", "easyJet", "Qatar", "Turkish"],
    funFact: {
      title: "Le tueur de Boeing 757",
      body: "L'A321XLR rend possible le transatlantique en monocouloir — JFK-Londres, JFK-Rome, JFK-Tel Aviv. Il prend le rôle laissé vacant par le 757 dont la production s'est arrêtée en 2004, et permet aux compagnies d'ouvrir des routes secondaires sans risquer un wide-body sous-rempli.",
    },
  },

  a350: {
    heading: "Le long-courrier nouvelle génération.",
    intro: [
      "L'Airbus A350 XWB (Xtra Wide Body) est la réponse européenne au Boeing 787 Dreamliner. Wide-body twin-engine en grande partie composite (53% du fuselage), motorisé par les Rolls-Royce Trent XWB, il offre une économie de carburant de 25% par rapport à la génération précédente.",
      "Sa cabine de 5,61 mètres de large autorise une configuration 3-3-3 spacieuse en économique et des suites individuelles en First. C'est aussi le détenteur du record du vol commercial le plus long au monde : Singapour-New York en environ 18h50, opéré en A350-900ULR par Singapore Airlines.",
    ],
    timeline: [
      { year: "2006", event: "Lancement officiel du programme XWB" },
      { year: "2013", event: "Premier vol depuis Toulouse" },
      { year: "2015", event: "Mise en service par Qatar Airways" },
      { year: "2018", event: "Ouverture Singapour-New York (A350-900ULR)" },
      { year: "2024", event: "Cap des 600 livraisons franchi" },
    ],
    specs: { capacity: "300-410 pax", range: "15 400 km", length: "66,8 m", cruise: "Mach 0,85" },
    airlines: ["Qatar Airways", "Singapore Airlines", "Cathay Pacific", "British Airways", "Air France", "Lufthansa", "Iberia", "Delta", "Japan Airlines", "Emirates"],
    funFact: {
      title: "Le record du vol commercial le plus long",
      body: "Singapore Airlines opère Singapour-New York en A350-900ULR : environ 18h50 de vol, 16 700 km parcourus sans escale. C'est le vol commercial régulier le plus long au monde — et il bat l'ancien record détenu... par lui-même sur Singapour-Newark (interrompu en 2013, relancé en 2018).",
    },
  },

  a380: {
    heading: "L'histoire d'un géant.",
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
    specs: { capacity: "525 pax", range: "14 800 km", length: "72,7 m", cruise: "Mach 0,85" },
    airlines: ["Emirates", "Singapore Airlines", "Qantas", "British Airways", "Lufthansa", "Air France", "Korean Air", "Etihad", "Qatar Airways", "Asiana"],
    funFact: {
      title: "L'équivalent de trois courts de tennis",
      body: "Avec 845 m² de surface alaire, 22 roues sur son train d'atterrissage et plus de 4 millions de pièces, l'A380 peut décoller à une masse maximale de 575 tonnes — soit l'équivalent de 380 voitures.",
    },
  },

  // ── BOEING ──
  b737: {
    heading: "Le pilier du low-cost mondial.",
    intro: [
      "Le Boeing 737 est l'avion de ligne le plus produit de l'histoire de l'aviation — plus de 11 000 exemplaires livrés depuis 1968. Du classique 737-200 des années 70 aux modernes 737 MAX, il a traversé six décennies en évoluant tout en conservant sa silhouette compacte caractéristique.",
      "Backbone absolu des low-cost (Ryanair, Southwest) et de nombreuses majors, le 737 dessert tous les continents. Son histoire récente est aussi marquée par la crise du MAX, immobilisé entre mars 2019 et fin 2020 après deux accidents tragiques liés au système MCAS — une page douloureuse pour Boeing.",
    ],
    timeline: [
      { year: "1964", event: "Lancement du programme 737" },
      { year: "1967", event: "Premier vol" },
      { year: "1968", event: "Mise en service chez Lufthansa" },
      { year: "1996", event: "Lancement de la génération 737NG" },
      { year: "2017", event: "Entrée en service 737 MAX" },
      { year: "2019", event: "Immobilisation mondiale du MAX (20 mois)" },
    ],
    specs: { capacity: "178-230 pax", range: "6 570 km", length: "39,5 m", cruise: "Mach 0,79" },
    airlines: ["Ryanair", "Southwest", "American", "United", "Delta", "Alaska", "Norwegian", "WestJet", "TUI", "Sun Country"],
    funFact: {
      title: "Plus de 10 000 livraisons",
      body: "En mars 2018, Boeing a livré son 10 000ème 737 — plus que tout autre avion de ligne. Un appareil décolle ou atterrit dans le monde toutes les deux secondes en moyenne. À tout instant, plusieurs milliers de 737 sont simultanément en vol.",
    },
  },

  b747: {
    heading: "La Reine des Airs.",
    intro: [
      "Le Boeing 747 est la Reine des Airs. Premier wide-body de l'histoire commerciale, il a inauguré l'ère du jumbo jet en 1970 avec Pan American. Sa bosse caractéristique — l'upper deck — reste l'une des silhouettes les plus reconnaissables de l'aviation civile.",
      "Pendant plus de 50 ans, le 747 a transporté chefs d'État (Air Force One), pèlerins (Hajj), passagers de luxe et tonnes de fret. Sa production s'est achevée en 2023 avec la livraison du dernier exemplaire à Atlas Air. Une icône qui clôt en silence l'âge des quadriréacteurs géants.",
    ],
    timeline: [
      { year: "1965", event: "Lancement du programme 747" },
      { year: "1969", event: "Premier vol" },
      { year: "1970", event: "Mise en service par Pan American" },
      { year: "1989", event: "Lancement du 747-400" },
      { year: "2011", event: "Mise en service du 747-8I" },
      { year: "2023", event: "Fin de production (livraison à Atlas Air)" },
    ],
    specs: { capacity: "410-467 pax", range: "14 320 km", length: "76,3 m", cruise: "Mach 0,86" },
    airlines: ["Pan Am (historique)", "Lufthansa", "KLM", "British Airways", "Korean Air", "Cathay Pacific", "Air France (retiré)", "Cargolux", "Atlas Air", "USAF (Air Force One)"],
    funFact: {
      title: "Pourquoi la bosse ?",
      body: "L'upper deck du 747 n'a pas été conçu pour les passagers à l'origine — Boeing voulait pouvoir ouvrir le nez de l'appareil pour le fret, ce qui imposait de placer le cockpit au-dessus. Les compagnies y ont vu une opportunité commerciale : un lounge ou des sièges premium pour leurs clients VIP.",
    },
  },

  b777: {
    heading: "Le bimoteur qui a tué les quadrijets.",
    intro: [
      "Le Boeing 777 a été le premier avion entièrement conçu par ordinateur (CAO) chez Boeing, et le premier avion commercial à entrer en service avec une certification ETOPS-180 dès le lancement — autorisation de voler jusqu'à 180 minutes d'un aéroport de déroutement, indispensable au transpacifique en bimoteur.",
      "Sa version la plus répandue, le 777-300ER, équipe les plus grandes compagnies long-courrier mondiales. Emirates en est de loin le premier opérateur. Le 777X de nouvelle génération, avec ses bouts d'ailes repliables et ses GE9X (les plus gros moteurs du monde), est attendu en service à partir de 2026.",
    ],
    timeline: [
      { year: "1990", event: "Lancement officiel du programme" },
      { year: "1994", event: "Premier vol" },
      { year: "1995", event: "Mise en service chez United (ETOPS-180)" },
      { year: "2004", event: "Mise en service du 777-300ER" },
      { year: "2020", event: "Premier vol du 777X" },
      { year: "2026", event: "Mise en service prévue du 777X" },
    ],
    specs: { capacity: "392 pax (777-300ER)", range: "13 650 km", length: "73,9 m", cruise: "Mach 0,84" },
    airlines: ["Emirates", "Qatar Airways", "Air France", "British Airways", "United", "ANA", "Cathay Pacific", "Singapore", "Korean Air", "Lufthansa"],
    funFact: {
      title: "Les plus gros moteurs au monde",
      body: "Les GE90-115B équipant les 777-300ER ont un diamètre de soufflante de 3,43 mètres — plus large que le fuselage entier d'un Boeing 737. Les futurs GE9X du 777X pousseront le record encore plus loin avec 3,40 mètres et 470 kN de poussée par moteur.",
    },
  },

  b787: {
    heading: "Le Dreamliner composite.",
    intro: [
      "Le Boeing 787 Dreamliner est le premier avion commercial à structure majoritairement composite (~50% du fuselage en fibres de carbone). Architecture entièrement électrique, pressurisation cabine équivalente à 1 800 m d'altitude (vs 2 400 m sur les avions classiques), humidité doublée, hublots 30% plus grands et à variateur électronique.",
      "Game-changer pour les compagnies, le Dreamliner ouvre des routes long-courriers à demande modérée qu'un wide-body classique ne pouvait pas rentabiliser. Son lancement a été marqué par une immobilisation mondiale en 2013 (problèmes de batteries lithium-ion), rapidement résolus.",
    ],
    timeline: [
      { year: "2004", event: "Lancement du programme 787" },
      { year: "2009", event: "Premier vol depuis Everett" },
      { year: "2011", event: "Mise en service chez All Nippon Airways" },
      { year: "2013", event: "Immobilisation mondiale (batteries) — 3 mois" },
      { year: "2014", event: "Mise en service du 787-9" },
      { year: "2017", event: "Mise en service du 787-10" },
    ],
    specs: { capacity: "248-296 pax (787-9)", range: "14 140 km", length: "62,8 m", cruise: "Mach 0,85" },
    airlines: ["ANA", "Japan Airlines", "Etihad", "Qatar", "British Airways", "Air France", "Lufthansa", "KLM", "United", "American"],
    funFact: {
      title: "Pas de cache-hublots à fermer",
      body: "Les hublots du 787 utilisent un verre électrochromique à variateur — un simple bouton fait passer le hublot de transparent à opaque en quelques secondes. Plus de cache plastique à descendre, et chaque passager peut moduler indépendamment sa lumière. Une révolution silencieuse.",
    },
  },

  // ── AUTRES ──
  concorde: {
    heading: "Le rêve supersonique.",
    intro: [
      "Le Concorde est le seul avion de ligne supersonique à avoir opéré commercialement de façon soutenue. Fruit d'une coopération franco-britannique signée par traité d'État en 1962, il volait à Mach 2,04 — environ 2 180 km/h — à 18 000 mètres d'altitude, deux fois plus vite et deux fois plus haut qu'un avion de ligne classique.",
      "Exploité conjointement par Air France et British Airways de janvier 1976 à octobre 2003, il reliait Paris-New York en 3h30 — soit l'avion qui « arrivait avant d'être parti » en heure locale. Son retrait après l'accident AF4590 et la chute du trafic post-11 septembre a clos l'âge du voyage supersonique commercial.",
    ],
    timeline: [
      { year: "1962", event: "Traité franco-britannique de coopération" },
      { year: "1969", event: "Premier vol (prototype 001 — Toulouse)" },
      { year: "1976", event: "Mise en service simultanée AF + BA" },
      { year: "2000", event: "Accident du vol AF4590 (Gonesse)" },
      { year: "2003", event: "Retrait définitif (BA le 26 octobre)" },
    ],
    specs: { capacity: "92-128 pax", range: "7 250 km", length: "62,1 m", cruise: "Mach 2,04" },
    airlines: ["Air France (7 appareils)", "British Airways (7 appareils)"],
    funFact: {
      title: "Arrivé avant d'être parti",
      body: "Sur Paris-New York, le Concorde décollait à 11h00 heure française et atterrissait à 8h45 heure locale à JFK — soit avant son heure de départ. Il franchissait l'Atlantique en 3h30, contre 8h pour un avion conventionnel. Le rêve du voyage supersonique commercial.",
    },
  },

  g650: {
    heading: "Le sommet du jet privé.",
    intro: [
      "Le Gulfstream G650 incarne le sommet absolu du jet privé long-courrier. Conçu par le constructeur de Savannah (Géorgie), il dispose d'une cabine de près de 17 mètres carrés, peut transporter jusqu'à 19 passagers ou aménager 8 couchages — et relie Hong Kong à New York sans escale dans sa version G650ER.",
      "Propulsé par deux Rolls-Royce BR725, il atteint Mach 0,925 en croisière — soit plus vite que n'importe quel avion de ligne, y compris l'A380 et le 747-8I (Mach 0,86). C'est le jet qu'on retrouve dans les flottes d'Elon Musk, Jeff Bezos ou Roman Abramovich, et que NetJets, VistaJet et Flexjet opèrent en charter.",
    ],
    timeline: [
      { year: "2005", event: "Annonce officielle du programme" },
      { year: "2009", event: "Premier vol depuis Savannah" },
      { year: "2012", event: "Mise en service" },
      { year: "2014", event: "Lancement du G650ER (Extended Range)" },
      { year: "2024", event: "Plus de 500 appareils livrés" },
    ],
    specs: { capacity: "11-19 pax", range: "12 964 km (ER)", length: "30,4 m", cruise: "Mach 0,925" },
    airlines: ["NetJets", "VistaJet", "Flexjet", "Propriétaires privés (Musk, Bezos, Abramovich...)"],
    funFact: {
      title: "Plus rapide qu'un avion de ligne",
      body: "Avec une vitesse de croisière de Mach 0,925, le G650 dépasse en vitesse pratiquement tous les avions de ligne commerciaux — A380, 747-8 et 777 plafonnent autour de Mach 0,86. Seul le défunt Concorde le dépassait. Il faut désormais 12-15 h heures pour Paris-Sydney au lieu de 21 h.",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Per-handle livery notes
// ─────────────────────────────────────────────────────────────────────────

type LiveryEntry = { model: keyof typeof AIRPLANE_STORIES; livery: LiveryNote };

export const LIVERY_NOTES: Record<string, LiveryEntry> = {
  // ── A220 ──
  "airbus-a220-air-france": {
    model: "a220",
    livery: {
      paragraph:
        "Air France a reçu son premier A220-300 en septembre 2021, et en exploite aujourd'hui plus de 30 appareils. Affecté au court et moyen-courrier européen depuis Paris-CDG — Lisbonne, Berlin, Madrid, Rome, Vienne — il remplace progressivement les A318 et A319 vieillissants. Avec sa cabine 2+3 et son silence en croisière, le A220 d'Air France propose l'une des expériences les plus modernes de l'aviation court-courrier européenne.",
    },
  },

  // ── A320 ──
  "a320-neo": {
    model: "a320",
    livery: {
      paragraph:
        "Air France a été client de lancement de l'A320 en 1988 — le premier exemplaire livré au monde portait son immatriculation. La compagnie en exploite aujourd'hui plus de 50 dans la livrée bleu marine emblématique. Affecté aux liaisons européennes et nord-africaines depuis Paris-CDG et Orly, l'A320 reste l'un des piliers du réseau court et moyen-courrier d'Air France, progressivement modernisé avec des A320neo plus efficients.",
    },
  },
  "airbus-a320-echelle-1-85-finition-premium": {
    model: "a320",
    livery: {
      paragraph:
        "Cette maquette reproduit la nouvelle identité visuelle d'Air France, dévoilée en avril 2021 — première refonte majeure depuis 1976. Le bleu marine s'éclaircit, les bandes rouge-blanc-bleu s'affinent et la marque s'affirme sur le fuselage. Cette livrée d'inspiration néo-classique équipe la flotte renouvelée et marque une rupture esthétique avec la précédente. Sur l'A320, elle exprime le compromis parfait entre tradition et modernité.",
    },
  },
  "airbus-a320-neo-transavia": {
    model: "a320",
    livery: {
      paragraph:
        "Transavia France, filiale low-cost d'Air France-KLM basée à Paris-Orly, a basculé sa flotte entière sur l'A320 en remplacement de ses Boeing 737 (retirés en 2024). La compagnie verte dessert principalement le bassin méditerranéen, le Maghreb et les destinations leisure européennes. Reconnaissable à sa livrée vert sapin et à son logo coloré, Transavia est devenue le bras armé low-cost du groupe AF-KLM sur le marché européen.",
    },
  },
  "copie-airbus-a320-echelle-1-85-finition-premium": {
    model: "a320",
    livery: {
      paragraph:
        "Édition collector célébrant le partenariat de longue date entre Qatar Airways et le Paris Saint-Germain. Cette livrée sponsor habille un A320 aux couleurs du club parisien — fond bleu marine profond, logo PSG et marque Qatar Airways. Une pièce limitée pour les fans du club autant que pour les amateurs de livrées commerciales sponsorisées, l'une des plus iconiques du football européen contemporain.",
    },
  },

  // ── A321 ──
  "a-321": {
    model: "a321",
    livery: {
      paragraph:
        "Air France a opéré l'A321 dès 1998 — version allongée de l'A320 pour les lignes européennes à fort trafic comme Londres-Heathrow, Madrid, Rome, Athènes. Avec sa silhouette allongée de 44,5 mètres et ses 220 places, l'A321 reste particulièrement adapté aux pointes de fréquentation estivales. La flotte est aujourd'hui en remplacement progressif au profit des A220-300, qui offrent une meilleure efficacité énergétique sur des routes équivalentes.",
    },
  },
  "airbus-a321-easyjet": {
    model: "a321",
    livery: {
      paragraph:
        "EasyJet exploite l'A321neo depuis 2018, principalement sur ses bases de Gatwick, Genève et Paris pour les routes à plus forte demande. Configuré en mono-classe avec 235 sièges, c'est l'arme low-cost ultime : coût par siège minimal, taux de remplissage optimisé. La livrée orange iconique d'EasyJet, lancée en 1995, est depuis trois décennies indissociable du paysage aéroportuaire européen.",
    },
  },

  // ── A350 ──
  "maquette-avion-maquette-airbus-a350-airfrance": {
    model: "a350",
    livery: {
      paragraph:
        "Air France a reçu son premier A350-900 en septembre 2019 (immatriculé F-HTYA), inaugurant le remplacement progressif des A340 et 777-200 sur les routes long-courriers. Affecté à Toronto, New York-JFK, Mexico, Shanghai, Le Cap, Pékin, le A350 a marqué une nouvelle ère pour la compagnie tricolore. Cabines en quatre classes, La Première en suite individuelle, ambiance « Cocoon » — l'A350 incarne le haut de gamme Air France de la décennie 2020.",
    },
  },
  "airbus-a350-singapore": {
    model: "a350",
    livery: {
      paragraph:
        "Singapore Airlines est le plus grand opérateur mondial d'A350, avec plus de 60 appareils en service. La compagnie a reçu en 2018 sa version A350-900ULR (Ultra Long Range), spécifiquement conçue pour les vols les plus longs au monde — Singapour-New York en environ 18h50, soit près de 16 700 km sans escale. La livrée bleu marine et or de Singapore reste l'une des plus iconiques du long-courrier moderne.",
    },
  },
  "airbus-a350-iberia": {
    model: "a350",
    livery: {
      paragraph:
        "Iberia, compagnie nationale espagnole, opère l'A350-900 depuis 2018 sur ses routes long-courriers vers l'Amérique latine — Buenos Aires, Mexico, Bogota, Lima, Quito. Sa livrée modernisée en 2013 arbore le rouge et jaune espagnol avec une typographie épurée. Membre de l'alliance OneWorld au sein du groupe IAG, Iberia a fait de l'A350 son fer de lance pour reconquérir le trafic transatlantique latino face à la concurrence du Golfe.",
    },
  },
  "airbus-a350-emirates": {
    model: "a350",
    livery: {
      paragraph:
        "Emirates a commandé 65 A350-900 lors du Dubai Airshow 2019, avec une première livraison en novembre 2024. Configurés en trois classes avec sa célèbre Business Suite « Game Changer », ces A350 viennent compléter sa flotte A380 et 777 sur les routes de moyenne longueur. La livrée or et rouge d'Emirates sur fond blanc reste l'une des plus reconnaissables de l'aviation commerciale mondiale.",
    },
  },

  // ── A380 ──
  "maquette-avion-maquette-airbus-a380": {
    model: "a380",
    livery: {
      paragraph:
        "Air France a opéré 10 Airbus A380 entre 2009 et 2020, immatriculés F-HPJA à F-HPJJ. Affecté à ses routes les plus prestigieuses — Paris-New York, Los Angeles, Mexico, Johannesburg, Shanghai — le Superjumbo de la compagnie tricolore arborait son drapeau caractéristique sur la dérive et accueillait 516 sièges en 4 classes. La flotte a été retirée prématurément en mai 2020, marquant la fin d'une époque pour Air France.",
    },
  },
  "airbus-a380-singapore": {
    model: "a380",
    livery: {
      paragraph:
        "Singapore Airlines a été le client de lancement du A380 le 25 octobre 2007, avec un vol commercial inaugural entre Singapour et Sydney. Configurés avec les fameuses Suites individuelles (vraies chambres avec lit double), ces A380 ont redéfini le luxe long-courrier. La compagnie en exploite encore une douzaine sur ses routes les plus prestigieuses : Londres-Heathrow, Sydney, Hong Kong, New York.",
    },
  },
  "airbus-a380-emirates": {
    model: "a380",
    livery: {
      paragraph:
        "Emirates est, et de loin, le plus grand opérateur mondial du A380 — 123 appareils livrés, soit près de la moitié de la production totale. Dubaï est devenue la capitale mondiale du Superjumbo, qui dessert depuis là plus de 50 destinations. Sa célèbre suite First Class avec douche en vol et son lounge à bord en upper deck font de l'A380 d'Emirates une icône absolue du voyage premium. Dernier exemplaire livré en décembre 2021.",
    },
  },

  // ── B737 ──
  "boeing-737-ryannair": {
    model: "b737",
    livery: {
      paragraph:
        "Ryanair est l'un des plus grands opérateurs mondiaux du Boeing 737, avec une flotte standardisée de plus de 450 appareils (737-800NG et 737 MAX 8-200). La compagnie irlandaise a fait du low-cost à l'européenne son modèle économique mondial, et le 737 — fiable, rentable, dense — en est l'instrument absolu. La livrée bleu vif et jaune équipe l'intégralité de la flotte depuis les années 90, omniprésente dans tous les aéroports européens.",
    },
  },

  // ── B747 ──
  "maquette-avion-maquette-boeing-747": {
    model: "b747",
    livery: {
      paragraph:
        "Air France a opéré le Boeing 747 de 1970 à 2016, soit 46 ans d'histoire commune. La compagnie a exploité toutes les versions civiles — 747-100, -200, -300 (Combi) et -400 — pour un total de plus de 70 appareils. Affecté aux routes prestigieuses (New York, Tokyo, Los Angeles, Mexico), le Jumbo Jet d'Air France a marqué plusieurs générations de passagers. Le retrait définitif a eu lieu en janvier 2016 lors d'un vol commémoratif Mexico-Paris.",
    },
  },
  "boeing-747-air-force-one": {
    model: "b747",
    livery: {
      paragraph:
        "« Air Force One » désigne tout avion de l'US Air Force transportant le président des États-Unis. Depuis 1990, ce rôle est tenu par deux Boeing 747-200B modifiés (désignation militaire VC-25A) — immatriculés 28000 et 29000. Ces appareils embarquent un centre de commandement complet, un système de ravitaillement en vol, un blindage anti-EMP et des contre-mesures classifiées. Le remplacement par deux 747-8I (VC-25B) est attendu pour 2027-2028.",
    },
  },

  // ── B777 ──
  "boeing-777": {
    model: "b777",
    livery: {
      paragraph:
        "Air France a reçu son premier 777-200ER en 1998 et a été client de lancement du 777-300ER en 2004. Au total, plus de 70 Boeing 777 ont rejoint la flotte tricolore, qui en exploite encore une cinquantaine. Affectés aux destinations long-courrier d'Amérique, d'Afrique et d'Asie, ces appareils arborent depuis 2009 la livrée bleu marine modernisée. Le 777 demeure aujourd'hui le pilier absolu du long-courrier d'Air France.",
    },
  },
  "boeing-777-qatar": {
    model: "b777",
    livery: {
      paragraph:
        "Cette livrée commémore la Coupe du Monde de la FIFA 2022, organisée au Qatar — première édition au Moyen-Orient. Qatar Airways, transporteur officiel de la compétition, a paré plusieurs de ses Boeing 777-300ER de cette livrée World Cup spéciale. La compagnie, régulièrement classée parmi les meilleures du monde, exploite l'une des plus grandes flottes 777 mondiales avec plus de 70 appareils.",
    },
  },

  // ── B787 ──
  "boeing-787": {
    model: "b787",
    livery: {
      paragraph:
        "Air France a reçu son premier 787-9 en décembre 2016, après une attente longue de plusieurs années. La compagnie en exploite aujourd'hui une dizaine, affectés à des routes long-courriers de moyenne capacité — Le Caire, Dakar, Maputo, Bangkok, Buenos Aires. Le Dreamliner a permis à Air France d'ouvrir ou de relancer des destinations à demande modérée tout en améliorant son empreinte carbone par rapport aux 777-200 vieillissants qu'il remplace.",
    },
  },
  "boeing-787-lufthansa-100th": {
    model: "b787",
    livery: {
      paragraph:
        "Cette livrée commémore le centenaire de Lufthansa célébré en 2026. Le Boeing 787-9 D-ABPA, premier Dreamliner livré à la compagnie allemande en août 2022, a été paré de cette livrée anniversaire avec le slogan « 100 Years of Innovation » et un drapeau allemand discret sur la dérive. La grue jaune historique de la Deutsche Lufthansa, dessinée en 1918, reste inchangée — 100 ans qu'elle survole le monde, l'un des logos les plus stables de l'aviation civile.",
    },
  },
  "boeing-787-etihad-manchester-city": {
    model: "b787",
    livery: {
      paragraph:
        "Etihad Airways, sponsor principal de Manchester City depuis 2009, a habillé l'un de ses Boeing 787-9 (A6-BLM) aux couleurs du club anglais. Bleu ciel, blanc et marine — ce Dreamliner est l'une des livrées sponsor les plus iconiques du football européen. Le partenariat unique au monde entre la compagnie nationale d'Abu Dhabi et le club champion de Premier League inclut également le nommage du stade (Etihad Stadium) et de plusieurs infrastructures du club.",
    },
  },

  // ── CONCORDE ──
  "concorde-airfrance": {
    model: "concorde",
    livery: {
      paragraph:
        "Air France a opéré 7 Concorde — F-BTSC, F-BTSD, F-BVFA, F-BVFB, F-BVFC, F-BVFD et F-BVFF — entre janvier 1976 et mai 2003. La compagnie tricolore reliait Paris-CDG à New York en 3h30, et a aussi desservi Caracas, Dakar et Rio dans les premières années d'exploitation. Après l'accident dramatique du vol AF4590 à Gonesse le 25 juillet 2000 et la chute du trafic post-11 septembre, Air France a tiré sa révérence le 31 mai 2003 lors d'un dernier vol commercial New York-Paris.",
    },
  },
  "concorde-british": {
    model: "concorde",
    livery: {
      paragraph:
        "British Airways a opéré 7 Concorde immatriculés G-BOAA à G-BOAG, en parallèle d'Air France et selon le même calendrier 1976-2003. La compagnie britannique a réalisé le tout dernier vol commercial supersonique de l'histoire le 26 octobre 2003 — un Édimbourg-Londres à bord du G-BOAG. Ses Concorde étaient particulièrement présents sur la ligne Londres-New York et opéraient également des vols charter spectaculaires : tours du monde, événements VIP, mariages princiers.",
    },
  },
  "concorde-airfrance-30cm": {
    model: "concorde",
    livery: {
      paragraph:
        "Version compacte 1/200 du Concorde Air France — idéale pour les amateurs souhaitant intégrer l'icône supersonique dans un espace plus restreint : étagère, bureau, vitrine. La livrée Air France respecte les codes originels avec son fuselage blanc nacré, sa cocarde tricolore sur la dérive et son logo « Concorde » stylisé. Une miniature qui condense toute la magie du seul appareil commercial à avoir franchi le mur du son régulièrement entre 1976 et 2003.",
    },
  },

  // ── AUTRES ──
  "jet-prive": {
    model: "g650",
    livery: {
      paragraph:
        "Le Gulfstream G650 incarne le sommet du jet privé long-courrier — cabine de près de 17 m², jusqu'à 19 passagers ou 8 couchages, autonomie Hong Kong-New York sans escale dans sa version G650ER. Propulsé par deux Rolls-Royce BR725, il atteint Mach 0,925 en croisière, plus rapide que tout avion de ligne commercial. Possédé par les ultra-fortunés (Elon Musk, Jeff Bezos, Roman Abramovich), il est aussi opéré en charter par NetJets, VistaJet et Flexjet — à partir d'environ 10 000 €/heure de vol.",
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
