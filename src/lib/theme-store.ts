import { createBrowserStore } from './browser-store';
import { THEME_COLORS, THEME_STORAGE_KEY, parseTheme, type Theme } from './theme';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
}

export const themeStore = createBrowserStore<Theme>({
  key: THEME_STORAGE_KEY,
  fallback: 'dark',
  parse: parseTheme,
  serialize: (theme) => theme,
  onChange: applyTheme,
});
