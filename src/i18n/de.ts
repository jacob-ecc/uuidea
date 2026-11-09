/**
 * Deutsches Wörterbuch. Alle UI-Texte leben hier, damit eine englische Version
 * später nur eine `en.ts` mit derselben Form braucht (siehe `Dict`-Typ).
 */
export const de = {
  meta: {
    siteName: 'uuidea',
    defaultTitle: 'uuidea – UUIDs mit Stil: Tools & Spiele',
    defaultDescription:
      'UUIDs generieren, prüfen, dekodieren – und kleine Spiele, deren Runden komplett aus einer UUID entstehen. Alles lokal im Browser.',
  },
  a11y: {
    skip: 'Zum Inhalt springen',
    mainNav: 'Hauptnavigation',
    copied: 'In die Zwischenablage kopiert',
    copyFailed: 'Kopieren hat nicht geklappt',
  },
  nav: {
    home: 'Start',
    tools: 'Tools',
    games: 'Spiele',
    about: 'Über',
  },
  common: {
    copy: 'Kopieren',
    copied: 'Kopiert',
    newUuid: 'Neue UUID',
    localOnly: 'Läuft komplett lokal in deinem Browser.',
  },
  home: {
    title: 'uuidea – Deine Session-UUID wartet',
    description:
      'Jeder Besuch bekommt eine eigene UUID. Dazu: Generatoren, Decoder und Spiele, die aus einer UUID entstehen.',
    eyebrow: 'Session · v4 · zufällig',
    lead: 'Das ist deine Session-UUID.',
    leadSerif: 'Es gibt sie nur dieses eine Mal.',
    privacy:
      'Erzeugt mit crypto.randomUUID() direkt in deinem Browser. Nichts wird gesendet – nur dieser Tab merkt sie sich, bis du ihn schließt.',
    stats: 'Mögliche v4-UUIDs',
    whyEyebrow: 'Warum UUIDs?',
    whyTitle: 'Kleine Ordnung in einem großen Chaos.',
    why: [
      {
        k: 'Struktur',
        t: '128 Bit, fünf Gruppen, immer 8-4-4-4-12. Eine UUID sieht aus wie jede andere – und ist doch anders.',
      },
      {
        k: 'Eindeutigkeit',
        t: 'Erzeuge eine Milliarde pro Sekunde, 85 Jahre lang – erst dann steht die Chance auf eine einzige Doppelung bei etwa 50 : 50.',
      },
      {
        k: 'Orientierung',
        t: 'Ohne zentrale Stelle, ohne Absprache: Jede UUID weiß, wer sie ist. Das ist Freiheit mit eingebauter Ordnung.',
      },
    ],
    exploreEyebrow: 'Entdecken',
    exploreTitle: 'Was du hier machen kannst',
    tiles: {
      tools: {
        k: 'Tools / 01',
        t: 'UUID-Werkzeugkasten',
        d: 'v1, v4, v5, v6, v7 – generieren, prüfen, dekodieren, umwandeln. Bis zu 1000 auf einmal.',
      },
      games: {
        k: 'Spiele / 02',
        t: 'Spiele aus einer UUID',
        d: 'Jede Runde entsteht deterministisch aus einer UUID. Link teilen, gleiche Runde, fairer Vergleich.',
      },
      about: {
        k: 'Über / 03',
        t: 'Warum das alles?',
        d: 'Eine kleine Liebeserklärung an 36 Zeichen.',
      },
    },
  },
  footer: {
    tagline: 'Eindeutig. Seit deinem letzten Refresh.',
    sessionLabel: 'Deine Session',
    noTracking: 'Kein Tracking. Keine Cookies. Keine Drittanbieter.',
    impressum: 'Impressum',
    datenschutz: 'Datenschutz',
  },
  notFound: {
    title: '404 – nicht gefunden',
    lead: 'Diese Seite hat die UUID',
    text: 'Also: keine. Die Nil-UUID ist die einzige, die garantiert nicht eindeutig ist – genau wie diese Adresse.',
    back: 'Zurück zum Start',
  },
  legal: {
    placeholder: 'Platzhalter – Inhalt folgt',
    impressumTitle: 'Impressum',
    datenschutzTitle: 'Datenschutz',
  },
} as const;

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };

/** Form, die jede weitere Sprache erfüllen muss. */
export type Dict = Widen<typeof de>;
