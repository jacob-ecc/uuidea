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
    title: 'uuidea – UUID-Tools und Spiele, alles lokal im Browser',
    description:
      'Jeder Besuch bekommt eine eigene UUID. Dazu: Generatoren, Decoder und Spiele, die aus einer UUID entstehen.',
    eyebrow: 'Session · v4 · zufällig',
    lead: 'Das ist deine Session-UUID.',
    leadSerif: 'Es gibt sie nur dieses eine Mal.',
    privacy:
      'Erzeugt mit crypto.randomUUID() direkt in deinem Browser. Nichts wird gesendet – nur dieser Tab merkt sie sich, bis du ihn schließt.',
    facts: [
      { v: '128', u: 'Bit', k: 'Länge' },
      { v: '122', u: 'Bit', k: 'davon Zufall' },
      { v: '5,3 × 10^36', u: '', k: 'mögliche v4-UUIDs' },
    ],
    statement: 'Eine unter Sextillionen.',
    statementSub:
      'Rund 5,3 Sextillionen v4-UUIDs gibt es. Erzeugst du eine Milliarde pro Sekunde, 85 Jahre lang, steht die Chance auf eine einzige Doppelung bei etwa 50 : 50.',
    whyTitle: 'Was in 36 Zeichen steckt',
    why: [
      {
        k: 'Fünf Gruppen, immer 8-4-4-4-12',
        t: '32 Hex-Zeichen, vier Bindestriche. Jede UUID sieht aus wie jede andere – und ist doch anders.',
      },
      {
        k: 'Version und Variante im Inneren',
        t: 'Ein Zeichen verrät die Version, zwei Bits die Variante. Der Rest ist Zeit, Name oder Zufall.',
      },
      {
        k: 'UUIDs ohne zentrales Register',
        t: 'Keine Datenbank, keine Absprache: Jede UUID weiß, wer sie ist. Freiheit mit eingebauter Ordnung.',
      },
    ],
    anatomyTitle: 'Anatomie einer v4-UUID',
    anatomy: [
      { k: 'Version', v: '4', d: 'Bits 48–51' },
      { k: 'Variante', v: '10xx', d: 'Bits 64–65 (RFC 9562)' },
      { k: 'Zufall', v: '122 Bit', d: 'alle übrigen Bits' },
    ],
    exploreTitle: 'Werkzeuge und Spiele rund um UUIDs',
    exploreLead: 'Alles läuft lokal. Kein Konto, kein Tracking, keine Wartezeit.',
    closeTitle: 'Deine nächste UUID wartet schon.',
    closeLead:
      'Generieren, prüfen, dekodieren – oder eine Runde spielen, die nur aus einer UUID besteht.',
    ctaTools: 'Tools öffnen',
    ctaGames: 'Spiel starten',
    tiles: {
      tools: {
        k: 'Tools',
        t: 'UUID-Werkzeugkasten',
        d: 'v1, v4, v5, v6, v7 – generieren, prüfen, dekodieren, umwandeln. Bis zu 1000 auf einmal.',
      },
      games: {
        k: 'Spiele',
        t: 'Spiele aus einer UUID',
        d: 'Jede Runde entsteht aus einer UUID. Link teilen, gleiche Runde, fairer Vergleich.',
      },
      about: {
        k: 'Über',
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
