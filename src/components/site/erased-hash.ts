/**
 * When hydration commits, Next's router writes the URL it started with back into
 * history. A hash change that lands between page load and that commit is erased
 * from `location`, and the site opens the wrong section. The `hashchange` event
 * still reports it, so an inline script records it before any bundle runs.
 */
const key = '__tesHashBeforeHydration';

declare global {
  interface Window { [key]?: string }
}

export const hashRecorderScript = `addEventListener('hashchange',function(e){window.${key}=new URL(e.newURL).hash})`;

/** The last hash change seen before the site mounted, if any. */
export function takeHashBeforeHydration(): string | null {
  const hash = window[key] ?? null;
  delete window[key];
  return hash;
}

/** Returns the current hash, putting `reported` back first if the router erased it. */
export function restoreErasedHash(reported: string | null): string {
  const { hash } = window.location;
  if (hash || !reported) return hash;
  window.history.replaceState(null, '', reported);
  return reported;
}
