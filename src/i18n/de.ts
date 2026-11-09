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
    title: 'uuidea – UUIDs erzeugen, prüfen, verstehen. Und damit spielen.',
    description:
      'Deine Session-UUID, ein Werkzeugkasten für v1 bis v7 und Spiele, deren Runden komplett aus einer UUID entstehen. Alles lokal im Browser.',
    h1: 'Deine Session‑UUID. Es gibt sie nur einmal.',
    lead: 'Gerade eben in deinem Browser entstanden, aus 122 Bit Zufall. Dazu: Werkzeuge und Spiele rund um UUIDs.',
    proof: 'Nichts wird gesendet. Nur dieser Tab merkt sie sich.',
    copy: 'UUID kopieren',
    renew: 'Neue UUID',
    inspector: {
      title: 'uuidea · Inspector',
      nav: ['Session', 'Generator', 'Decoder', 'Konverter', 'Spiele'],
      head: 'Session-UUID',
      bits: '128 Bit',
      rows: [
        { k: 'Version', v: '4 · zufällig' },
        { k: 'Variante', v: 'RFC 9562' },
        { k: 'Zufall', v: '122 Bit' },
        { k: 'Base64URL', v: '…', f: 'b64' },
        { k: 'Base58', v: '…', f: 'b58' },
      ],
      check: 'Validator',
      checkOk: 'Gültig',
      steps: ['Format 8-4-4-4-12', 'Version-Nibble = 4', 'Varianten-Bits = 10'],
    },
    statement: 'Eine unter Sextillionen.',
    statementSub:
      'Rund 5,3 Sextillionen v4-UUIDs gibt es. Erzeugst du eine Milliarde pro Sekunde, 85 Jahre lang, steht die Chance auf eine einzige Doppelung bei etwa 50 : 50.',
    stats: [
      { v: '128', k: 'Bit lang, immer' },
      { v: '122', k: 'Bit davon Zufall' },
      { v: '36', k: 'Zeichen in fünf Gruppen' },
      { v: '1000', k: 'UUIDs pro Klick im Generator' },
    ],
    toolsTitle: 'Ein Werkzeugkasten für 36 Zeichen',
    toolsLead:
      'Erzeugen, prüfen, dekodieren, umwandeln. Jede Version, jedes Format – und nichts davon verlässt deinen Browser.',
    toolsCta: 'Tools öffnen',
    tools: {
      gen: {
        k: 'Generator',
        d: 'v1, v4, v5, v6, v7, Nil und Max. Bis zu 1000 auf einmal, als .txt oder .csv.',
      },
      dec: {
        k: 'Decoder',
        d: 'Version, Variante und der eingebaute Zeitstempel von v1, v6 und v7.',
      },
      conv: {
        k: 'Konverter',
        d: 'Mit oder ohne Bindestriche, in Klammern, Base64URL oder Base58.',
      },
    },
    formats: [
      'v1',
      'v4',
      'v5',
      'v6',
      'v7',
      'Nil',
      'Max',
      'ULID',
      'Nano ID',
      'Base58',
      'Base64URL',
      '{Klammern}',
      'GROSS',
      'CSV',
      'TXT',
    ],
    gamesTitle: 'Spiele, die aus einer UUID entstehen',
    gamesLead:
      'Jede Runde wird aus einer UUID berechnet: Kartenlage, Reihenfolge, Wartezeiten. Gleiche UUID, gleiche Runde – teil den Link und vergleicht euch fair.',
    gamesCta: 'Spiel starten',
    pipeline: ['UUID', 'cyrb128', 'sfc32', 'Runde'],
    gameNames: ['Reaktion', 'Memory', 'Sortieren', 'Sequenz', 'Hex-Farben'],
    challenge: 'Herausforderung von',
    challengeScore: '14 Züge · 0:48',
    closeTitle: 'Deine nächste UUID wartet schon.',
    closeLead:
      'Generieren, prüfen, dekodieren – oder eine Runde spielen, die nur aus einer UUID besteht.',
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
