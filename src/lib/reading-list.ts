import { createBrowserStore } from './browser-store';

const EMPTY: string[] = [];

/** Saved story slugs. Anything malformed in storage is ignored. */
export function parseReadingList(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    return [...new Set(value.filter((item): item is string => typeof item === 'string'))];
  } catch {
    return EMPTY;
  }
}

export const readingListStore = createBrowserStore<string[]>({
  key: 'tes-reading-list',
  fallback: EMPTY,
  parse: parseReadingList,
  serialize: (slugs) => JSON.stringify(slugs),
});
