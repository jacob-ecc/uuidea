import { de, type Dict } from './de';

export type Locale = 'de';

const dicts: Record<Locale, Dict> = { de };

export const defaultLocale: Locale = 'de';

/** Wörterbuch für eine Sprache. Später: `useDict(Astro.currentLocale)`. */
export function useDict(locale: Locale = defaultLocale): Dict {
  return dicts[locale];
}

export const t = useDict();
