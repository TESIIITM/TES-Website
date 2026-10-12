const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** `2026-01-30` → `30 JAN 2026`. Parsed by hand so it never shifts with the time zone. */
export function formatStoryDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

/** Initials for a portrait placeholder, skipping titles such as "Dr.". */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter((word) => word && !word.endsWith('.'));
  if (words.length === 0) return '';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

/** Two-digit index used throughout the design: 1 → `01`. */
export function ordinal(index: number): string {
  return String(index).padStart(2, '0');
}

/** "Tech" + "Lekhan." → "Tech Lekhan." */
export function announcementTitle({ title, titleEmphasis }: { title: string; titleEmphasis: string | null }): string {
  return titleEmphasis ? `${title} ${titleEmphasis}` : title;
}
