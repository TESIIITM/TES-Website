const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** `2026-01-30` → `30 JAN 2026`. Parsed by hand so it never shifts with the time zone. */
export function formatStoryDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

/** The Tuesday on or before a date, as `YYYY-MM-DD`. Weekly news goes out on Tuesdays and is grouped by it. */
export function weekStart(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 5) % 7));
  return date.toISOString().slice(0, 10);
}

/** Short counts for stats: 950 → `950`, 1234 → `1.2k`, 25000 → `25k`. */
export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  const thousands = value / 1000;
  return `${thousands < 10 ? Math.floor(thousands * 10) / 10 : Math.floor(thousands)}k`;
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
