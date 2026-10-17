import { expect, test } from '@playwright/test';

// CI builds without Supabase, so the form reports that applications are closed.
// The full flow, with a database, is in admin-applications.spec.ts.

test('the JOIN TES button leads to a shareable application page', async ({ page }, testInfo) => {
  await page.goto('/');
  const join = page.locator('.site-header').getByRole('link', { name: 'Join TES' });
  await expect(join).toBeVisible();
  await expect(join).toHaveAttribute('href', '/join');
  if (testInfo.project.name === 'desktop') {
    await expect(page.locator('.join-band').getByRole('link', { name: /Join TES/ })).toHaveAttribute('href', '/join');
  }

  await join.click();
  await expect(page).toHaveURL(/\/join$/);
  await expect(page).toHaveTitle(/Join TES/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Join TES/);
  await expect(page.getByRole('link', { name: 'Back to the site' })).toBeVisible();
});

test('the application page has no horizontal overflow', async ({ page }) => {
  await page.goto('/join');
  await expect(page.locator('main')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('without a database the form says applications are closed', async ({ page }) => {
  test.skip(Boolean(process.env.E2E_ADMIN_EMAIL), 'Runs against the bundled content only.');
  await page.goto('/join');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Applications are closed.');
});
