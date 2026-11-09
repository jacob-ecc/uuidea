/** Ausgabeformate für UUIDs (Generator & Konverter). */
import { bytesToBase58, bytesToBase64Url, toBytes } from './bytes';

export type Encoding = 'hex' | 'base64url' | 'base58';

export interface FormatOpts {
  encoding: Encoding;
  upper: boolean;
  hyphens: boolean;
  braces: boolean;
}

export const DEFAULT_FORMAT: FormatOpts = {
  encoding: 'hex',
  upper: false,
  hyphens: true,
  braces: false,
};

/** Formatiert eine kanonische UUID. Groß/Bindestriche/Klammern gelten nur für Hex. */
export function formatUuid(uuid: string, o: FormatOpts = DEFAULT_FORMAT): string {
  if (o.encoding !== 'hex') {
    const b = toBytes(uuid);
    if (!b) return uuid;
    return o.encoding === 'base64url' ? bytesToBase64Url(b) : bytesToBase58(b);
  }
  let s = o.hyphens ? uuid : uuid.replace(/-/g, '');
  if (o.upper) s = s.toUpperCase();
  return o.braces ? `{${s}}` : s;
}

/** Alle Darstellungen einer UUID für den Konverter. */
export function allFormats(uuid: string): { key: string; label: string; value: string }[] {
  const b = toBytes(uuid);
  if (!b) return [];
  return [
    { key: 'standard', label: 'Standard', value: uuid },
    { key: 'upper', label: 'Großbuchstaben', value: uuid.toUpperCase() },
    { key: 'compact', label: 'Ohne Bindestriche', value: uuid.replace(/-/g, '') },
    { key: 'braces', label: 'Mit Klammern (Microsoft)', value: `{${uuid.toUpperCase()}}` },
    { key: 'urn', label: 'URN', value: `urn:uuid:${uuid}` },
    { key: 'base64url', label: 'Base64URL (22 Zeichen)', value: bytesToBase64Url(b) },
    { key: 'base58', label: 'Base58', value: bytesToBase58(b) },
    {
      key: 'bytes',
      label: 'Bytes (Hex-Array)',
      value: `[${[...b].map((x) => '0x' + x.toString(16).padStart(2, '0')).join(', ')}]`,
    },
  ];
}
