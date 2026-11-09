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
  toolsPage: {
    title: 'UUID-Tools – Generator, Decoder, Konverter | uuidea',
    description:
      'UUIDs v1, v4, v5, v6, v7, Nil und Max erzeugen (bis 1000 auf einmal), prüfen, dekodieren und umwandeln. Dazu ULID und Nano ID. Alles lokal im Browser.',
    eyebrow: 'Tools',
    h1: 'Der UUID-Werkzeugkasten',
    lead: 'Erzeugen, prüfen, dekodieren, umwandeln. Alles passiert in deinem Browser – nichts wird gesendet, nichts gespeichert.',
    nav: {
      generator: 'Generator',
      decoder: 'Decoder',
      converter: 'Konverter',
      alt: 'ULID & Nano ID',
    },
    gen: {
      h2: 'Generator',
      lead: 'Wähle eine Version, eine Menge und ein Format.',
      version: 'Version',
      versions: {
        v4: 'Zufall',
        v7: 'Unix-Zeit',
        v1: 'Zeit + Knoten',
        v6: 'Zeit, sortierbar',
        v5: 'Name (SHA-1)',
        nil: 'Nil',
        max: 'Max',
      },
      count: 'Anzahl',
      countHint: '1 bis 1000',
      format: 'Format',
      encodings: { hex: 'Hex', base64url: 'Base64URL', base58: 'Base58' },
      upper: 'Großbuchstaben',
      noHyphens: 'Ohne Bindestriche',
      braces: 'Geschweifte Klammern',
      namespace: 'Namespace',
      customNs: 'Eigene Namespace-UUID',
      names: 'Namen (einer pro Zeile)',
      namesPlaceholder: 'uuidea.de\nwww.example.com',
      generate: 'Neu erzeugen',
      copyAll: 'Alle kopieren',
      txt: '.txt',
      csv: '.csv',
      rowHint: 'Antippen kopiert eine einzelne UUID.',
      fixedHint: 'Nil und Max sind Konstanten – es gibt genau eine.',
      nsInvalid: 'Das ist keine gültige Namespace-UUID.',
      empty: 'Gib mindestens einen Namen ein.',
      generated: (n: number) => `${n} ${n === 1 ? 'UUID' : 'UUIDs'} erzeugt`,
    },
    dec: {
      h2: 'Validator & Decoder',
      lead: 'Füge eine UUID in beliebiger Schreibweise ein – auch Base64URL, Base58 oder mit urn:uuid:.',
      label: 'UUID zum Prüfen',
      placeholder: 'z. B. 017f22e2-79b0-7cc3-98c4-dc0c0c07398f',
      useSession: 'Session-UUID einfügen',
      useV7: 'Beispiel v7',
      empty: 'Das Ergebnis erscheint hier, sobald du etwas einfügst.',
      valid: 'Gültig',
      invalid: 'Ungültig',
      input: 'Eingabeformat',
      formats: {
        standard: 'Standard (8-4-4-4-12)',
        compact: 'Ohne Bindestriche',
        braces: 'Geschweifte Klammern',
        urn: 'URN',
        base64url: 'Base64URL',
        base58: 'Base58',
      },
      version: 'Version',
      variant: 'Variante',
      time: 'Eingebettete Zeit',
      timeLocal: 'Lokal',
      timeUtc: 'UTC',
      clockSeq: 'Clock-Sequenz',
      node: 'Knoten',
      nil: 'Die Nil-UUID: alle 128 Bit sind 0. Ein Platzhalter für „keine UUID“.',
      max: 'Die Max-UUID: alle 128 Bit sind 1. Das Gegenstück zur Nil-UUID.',
      ambiguous: (fmt: string) =>
        `Diese Eingabe ist auch als ${fmt} gültig. Gemeint war vielleicht diese UUID:`,
      useAlt: 'Diese Lesart verwenden',
      hint: 'Tipp: Version und Variante stehen an festen Stellen – im 13. Zeichen und im 17. Zeichen.',
    },
    conv: {
      h2: 'Konverter',
      lead: 'Eine UUID, alle Schreibweisen. Erkennt auch ULIDs.',
      label: 'UUID oder ULID',
      ulid: 'Als ULID (Crockford Base32)',
      fromUlid: 'Aus einer ULID gelesen',
    },
    alt: {
      h2: 'ULID & Nano ID im Vergleich',
      lead: 'Drei Wege zu einer eindeutigen ID. Jede hat ihre Stärken.',
      regenerate: 'Neu erzeugen',
      cols: {
        name: 'Format',
        example: 'Beispiel',
        length: 'Länge',
        bits: 'Zufall',
        sortable: 'Sortierbar',
      },
      yes: 'ja',
      no: 'nein',
      rows: {
        v4: 'Standard, überall unterstützt. Reiner Zufall.',
        v7: 'Moderner Standard. Zeit vorne – perfekt für Datenbank-Indizes.',
        ulid: 'Wie v7, aber kürzer und ohne Bindestriche (Crockford Base32).',
        nanoid: 'Kurz und URL-sicher. Kein Standard, keine Zeit – nur Zufall.',
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
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Widen<R>
    : T extends readonly (infer U)[]
      ? readonly Widen<U>[]
      : { readonly [K in keyof T]: Widen<T[K]> };

/** Form, die jede weitere Sprache erfüllen muss. */
export type Dict = Widen<typeof de>;
