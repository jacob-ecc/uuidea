/** Teilt eine kanonische UUID in ihre 5 Segmente (8-4-4-4-12). */
export function segments(uuid: string): [string, string, string, string, string] | null {
  const m = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i.exec(uuid);
  if (!m) return null;
  return [m[1]!, m[2]!, m[3]!, m[4]!, m[5]!];
}

/** HTML-Markup für die farbige Segment-Darstellung (nur für vertrauenswürdige, validierte UUIDs). */
export function segmentHtml(uuid: string): string {
  const s = segments(uuid);
  if (!s) return uuid.replace(/[<>&"]/g, '');
  return s
    .map((seg, i) => `<span class="s${i + 1}">${seg}</span>`)
    .join('<span class="dash">-</span>');
}
