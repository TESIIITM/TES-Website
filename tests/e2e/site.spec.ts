import { expect, test, type Page } from '@playwright/test';

async function selected(page: Page, name: 'Build' | 'Learn' | 'Gather') {
  await expect(page.getByRole('tab', { name: new RegExp(name) })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(`[role="tabpanel"]#panel-${name.toLowerCase()}`)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`));
}

test('Back and Forward restore every tab, including the reported Projects → Learn → Gather flow', async ({ page }) => {
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('tab', { name: /Learn/ }).click();
  await page.getByRole('tab', { name: /Gather/ }).click();
  await selected(page, 'Gather');
  await page.goBack();
  await selected(page, 'Learn');
  await page.goBack();
  await selected(page, 'Build');
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
  await page.goForward();
  await selected(page, 'Build');
  await page.goForward();
  await selected(page, 'Learn');
  await page.goForward();
  await selected(page, 'Gather');
});

test('reselecting a tab does not add duplicate history entries', async ({ page }) => {
  await page.goto('/#build');
  await page.getByRole('tab', { name: /Learn/ }).click();
  await page.getByRole('tab', { name: /Learn/ }).click();
  await page.goBack();
  await selected(page, 'Build');
});

test('keyboard tab changes create history and preserve roving focus', async ({ page }) => {
  await page.goto('/#build');
  await page.getByRole('tab', { name: /Build/ }).focus();
  await page.keyboard.press('ArrowRight');
  await selected(page, 'Learn');
  await expect(page.getByRole('tab', { name: /Learn/ })).toBeFocused();
  await page.keyboard.press('End');
  await selected(page, 'Gather');
  await page.goBack();
  await selected(page, 'Learn');
});

test('deep links, reload, and Society/Home navigation stay synchronized', async ({ page }) => {
  await page.goto('/#gather');
  await selected(page, 'Gather');
  await page.reload();
  await selected(page, 'Gather');
  await page.locator('.hero-copy a[href="#about"]').click();
  await expect(page).toHaveURL(/#about$/);
  await page.locator('.site-header .brand').click();
  await expect(page).toHaveURL(/#home$/);
  await page.goBack();
  await expect(page).toHaveURL(/#about$/);
  await page.goBack();
  await selected(page, 'Gather');
});

test('untrusted preferences are validated and valid saves persist', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('tes-theme', 'invalid-theme');
    localStorage.setItem('tes-reading-list', JSON.stringify(['opensource', 'opensource', 'unknown-id', 42, null]));
  });
  await page.goto('/#learn');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: /^Saved/ }).click();
  await expect(page.locator('.story-row')).toHaveCount(1);
  await expect(page.getByRole('status')).toContainText('1 STORY');
  await page.getByRole('button', { name: 'Remove Understanding Open Source', exact: true }).click();
  await expect(page.locator('.story-row')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset reading list' }).click();
  await page.getByRole('button', { name: 'Save Understanding Open Source', exact: true }).click();
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Remove Understanding Open Source', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('malformed and unavailable storage leave the website usable', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('tes-reading-list', '{invalid JSON'));
  await page.goto('/#learn');
  await expect(page.locator('.story-row')).toHaveCount(4);
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Storage disabled', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Storage disabled', 'SecurityError'); };
  });
  await page.reload();
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Save Understanding Open Source', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove Understanding Open Source', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('production UI has no runtime errors, broken images, or horizontal overflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1')) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Open command menu' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('combobox').fill('learn');
  await page.getByRole('combobox').press('Enter');
  await selected(page, 'Learn');
  await page.getByPlaceholder('Search the reading list').fill('Go to Build');
  await expect(page.locator('.story-row')).toHaveCount(1);
  await page.getByRole('tab', { name: /Gather/ }).click();
  await page.getByText('How it works', { exact: false }).click();
  await expect(page.locator('details')).toHaveAttribute('open', '');
  await page.locator('#about').scrollIntoViewIfNeeded();
  await expect(page.locator('.people-grid img').first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => Array.from(document.images).filter(img => img.complete && img.naturalWidth === 0).map(img => img.src))).toEqual([]);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
