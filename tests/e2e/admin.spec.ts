import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';

// Needs a running Supabase stack with seed data and an admin account, e.g.
// E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… pnpm test:e2e admin
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.skip(!email || !password, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the dashboard tests.');
test.describe.configure({ mode: 'serial' });
test.use({ viewport: { width: 1280, height: 900 } });

const save = (page: Page) => page.locator('main').getByRole('button', { name: /^(Add|Save|Create)/ }).click();

async function signIn(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Password').fill(password!);
  await page.locator('main').getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test('a wrong password is rejected without saying which part was wrong', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Password').fill('not-the-password');
  await page.locator('main').getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('.admin-message-error')).toHaveText('That email and password did not match an account.');
  await expect(page.getByLabel('Email')).toHaveValue(email!);
});

test('a member added in the dashboard appears on the site and can be removed', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Writes shared data; run once.');
  await signIn(page);
  await page.goto('/admin/members/new');

  await page.getByLabel('Name').fill('Playwright Member');
  await page.getByLabel('LinkedIn profile').fill('http://example.org');
  await save(page);
  await expect(page.locator('#role-error')).toHaveText('Required.');
  await expect(page.locator('#linkedinUrl-error')).toContainText('https://');
  await expect(page.getByLabel('Name')).toHaveValue('Playwright Member');

  await page.getByLabel('Role').fill('Test role');
  await page.getByLabel('LinkedIn profile').fill('https://www.linkedin.com/in/example');
  await page.getByLabel('Portrait').setInputFiles(path.join(process.cwd(), 'public/assets/team/mithul.jpg'));
  await save(page);
  await expect(page).toHaveURL(/\/admin\/members$/);

  const site = await browser.newPage();
  await site.goto('/#about');
  const card = site.locator('.person-card', { hasText: 'Playwright Member' });
  await expect(card).toContainText('Test role');
  await expect(card.locator('img')).toHaveAttribute('src', /portraits/);
  await site.close();

  const row = page.locator('tr', { hasText: 'Playwright Member' });
  await row.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(row).toHaveCount(0);
});

test('files that are not real images are refused', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Writes shared data; run once.');
  await signIn(page);
  await page.goto('/admin/members/new');
  await page.getByLabel('Name').fill('Not An Image');
  await page.getByLabel('Role').fill('Test');
  await page.getByLabel('Portrait').setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>') });
  await save(page);
  await expect(page.locator('main')).toContainText('Upload a JPEG, PNG, or WebP image.');
});

test('the newest published announcement is featured under Gather', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Writes shared data; run once.');
  await signIn(page);
  await page.goto('/admin/announcements/new');
  await page.getByLabel('Title', { exact: true }).fill('Playwright');
  await page.getByLabel('Second line').fill('Night.');
  await page.getByLabel('Summary').fill('An end-to-end test announcement.');
  await page.getByLabel('Main button', { exact: true }).fill('Register');
  await save(page);
  await expect(page.locator('#primaryUrl-error')).toHaveText('Add a link for this button.');

  await page.getByLabel('Main button link').fill('https://example.org/register');
  await page.getByLabel('Date').fill('2099-01-01');
  await page.getByLabel('Publish on the site').check();
  await save(page);
  await expect(page.locator('tr', { hasText: 'Playwright Night.' })).toContainText(/featured/i);

  const site = await browser.newPage();
  await site.goto('/#gather');
  await expect(site.locator('.event-details h3')).toHaveText(/Playwright\s*Night\./);
  await expect(site.getByRole('link', { name: /Register/ })).toHaveAttribute('href', 'https://example.org/register');
  await site.close();

  const row = page.locator('tr', { hasText: 'Playwright Night.' });
  await row.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(row).toHaveCount(0);
});

test('a tech news link appears in the latest week on the site', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Writes shared data; run once.');
  await signIn(page);
  await page.goto('/admin/news/new');
  // Title first, so leaving the link field doesn't fetch a preview from the network.
  await page.getByLabel('Title').fill('Playwright digest link');
  await page.getByLabel('Link').fill('http://example.org/story');
  await save(page);
  await expect(page.locator('#url-error')).toContainText('https://');

  await page.getByLabel('Link').fill('https://example.org/story');
  await page.getByLabel('Source').fill('Example Weekly');
  // A Thursday; the row is stored under that week's Monday, which makes it the latest week.
  await page.getByLabel('Week').fill('2099-01-01');
  await page.getByLabel('Preview image').setInputFiles(path.join(process.cwd(), 'public/assets/team/mithul.jpg'));
  await save(page);
  const row = page.locator('tr', { hasText: 'Playwright digest link' });
  await expect(row).toContainText('29 DEC 2098');

  const site = await browser.newPage();
  await site.goto('/#news');
  await expect(site.locator('#news .eyebrow')).toContainText('WEEK OF 29 DEC 2098');
  const card = site.locator('.news-card', { hasText: 'Playwright digest link' });
  await expect(card).toHaveAttribute('href', 'https://example.org/story');
  await expect(card).toContainText('Example Weekly');
  await expect(card.locator('img')).toHaveAttribute('src', /news-images/);
  await site.close();

  await row.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(row).toHaveCount(0);
});

test('an invalid or used email link explains what to do', async ({ page }) => {
  await page.goto('/admin/auth/confirm?token_hash=not-a-real-token&type=invite');
  await expect(page).toHaveURL(/\/admin\/login\?link=invalid$/);
  await expect(page.locator('.admin-message-error')).toContainText('That link has expired or was already used.');
  await page.goto('/admin/set-password');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('an admin can change their own password', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Changes the shared admin password; run once.');
  const changeTo = async (current: string, next: string) => {
    await page.getByLabel('Current password').fill(current);
    await page.getByLabel('New password', { exact: true }).fill(next);
    await page.getByLabel('Confirm new password').fill(next);
    await page.locator('main').getByRole('button', { name: 'Change password' }).click();
  };

  await signIn(page);
  await page.getByRole('link', { name: 'Password' }).click();
  await expect(page).toHaveURL(/\/admin\/account$/);

  await changeTo('not-the-password', 'a brand new password 1');
  await expect(page.locator('#currentPassword-error')).toHaveText('That is not your current password.');

  const temporary = `${password}-changed`;
  await changeTo(password!, temporary);
  await expect(page.getByRole('status')).toHaveText('Password changed. Use the new one next time you sign in.');
  await changeTo(temporary, password!);
  await expect(page.getByRole('status')).toHaveText('Password changed. Use the new one next time you sign in.');
});

test('signing out closes the dashboard', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto('/admin/settings');
  await expect(page).toHaveURL(/\/admin\/login$/);
});
