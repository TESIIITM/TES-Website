export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'tes-theme';

/** The `--bg` token of each theme, for the browser UI colour. */
export const THEME_COLORS: Record<Theme, string> = { dark: '#040404', light: '#ebeae3' };

export function parseTheme(raw: string | null): Theme {
  return raw === 'light' ? 'light' : 'dark';
}

/**
 * Runs in <head> before first paint so a saved light theme never flashes dark.
 * It also owns the theme-color tag: React would duplicate a server-rendered one
 * once this script changed it. Keep in step with `parseTheme` and `themeStore`.
 */
export const themeInitScript = `(() => {
  let theme = 'dark';
  try { if (localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}) === 'light') theme = 'light'; } catch {}
  document.documentElement.dataset.theme = theme;
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = ${JSON.stringify(THEME_COLORS)}[theme];
  document.head.append(meta);
})();`;
