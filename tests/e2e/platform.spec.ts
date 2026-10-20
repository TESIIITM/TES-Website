import { expect, test } from '@playwright/test';

test('a saved light theme is applied before the page hydrates', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tes-theme', 'light'));
  const themes: (string | null)[] = [];
  // Record the theme at the first moment the document is parsed, before any bundle runs.
  await page.exposeFunction('recordTheme', (theme: string | null) => themes.push(theme));
  await page.addInitScript(() => {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'interactive') (window as unknown as { recordTheme: (t: string | null) => void }).recordTheme(document.documentElement.dataset.theme ?? null);
    }, { once: true });
  });
  await page.goto('/');
  await expect.poll(() => themes[0]).toBe('light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#ebeae3');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
});

test('a hash change before hydration finishes is not lost', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CPU throttling needs the Chrome DevTools Protocol');
  test.setTimeout(60_000);
  // Slow the page enough that `load` fires well before React hydrates, as on CI runners.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.goto('/');
  await page.goto('/#learn');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await expect(page.getByRole('tab', { name: /Learn/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page).toHaveURL(/#learn$/);
});

test('pages are served with a nonce-based content security policy', async ({ request }) => {
  const response = await request.get('/');
  const csp = response.headers()['content-security-policy'];
  expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(csp).toContain("frame-ancestors 'none'");
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-powered-by']).toBeUndefined();
});

test('every inline script carries the request nonce', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors.filter((error) => error.includes('Content Security Policy'))).toEqual([]);
});

test('legacy pages redirect to their sections', async ({ page }) => {
  await page.goto('/about/');
  await expect(page).toHaveURL(/\/#about$/);
  await page.goto('/articles');
  await expect(page).toHaveURL(/\/#learn$/);
  await expect(page.getByRole('tab', { name: /Learn/ })).toHaveAttribute('aria-selected', 'true');
});

test('unknown pages render the styled not-found page', async ({ page }) => {
  const response = await page.goto('/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Off the map.' })).toBeVisible();
  await expect(page).toHaveTitle('Page not found');
});

test('signed-out visitors are sent from the dashboard to sign in', async ({ page }) => {
  await page.goto('/admin/members');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in.' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
