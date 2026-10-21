/* Unsent answers, kept in sessionStorage so a refresh does not lose them. They go when the tab closes or the form is sent. */

const KEY = 'tes-join-draft';
/** The file cannot be refilled by the browser, the trap is for bots, and consent is given fresh. */
const SKIP = new Set(['resume', 'website', 'consent']);

export type Draft = Record<string, string>;

export function readDraft(): Draft | null {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const entries = Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && !SKIP.has(entry[0]));
    return entries.length ? Object.fromEntries(entries) : null;
  } catch {
    return null;
  }
}

/** Stored in the shape the server returns, with checkbox picks one per line. */
export function saveDraft(form: HTMLFormElement) {
  const data = new FormData(form);
  const draft: Draft = {};
  for (const name of new Set(data.keys())) {
    if (SKIP.has(name)) continue;
    draft[name] = data.getAll(name).filter((value) => typeof value === 'string').join('\n');
  }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Storage blocked or full: the form still works, it just is not kept.
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing was stored.
  }
}
