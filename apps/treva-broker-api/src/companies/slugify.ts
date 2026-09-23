// Letters NFKD does not decompose into a base letter plus a mark.
const TRANSLITERATION: Record<string, string> = {
  ə: 'e',
  ı: 'i',
  ş: 's',
  ç: 'c',
  ğ: 'g',
  ö: 'o',
  ü: 'u',
  ß: 'ss',
  æ: 'ae',
  ø: 'o',
  đ: 'd',
  ł: 'l',
};

/**
 * "Omnuvex  MMC" and "omnuvex mmc" are the same company: the slug is what makes
 * a name unique, so it folds case, Azerbaijani letters and punctuation away.
 * Returns "" for a name with no letters or digits at all.
 */
export function slugify(name: string): string {
  return name
    .toLocaleLowerCase('az')
    .replace(/[əışçğöüßæøđł]/g, (char) => TRANSLITERATION[char] ?? char)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
