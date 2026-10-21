import { expect, test, type Page } from '@playwright/test';

// Needs a running Supabase stack with an admin account, and SUPABASE_SECRET_KEY
// in .env.local so the form can save, e.g.
// E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… pnpm test:e2e admin
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.skip(!email || !password, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the dashboard tests.');
test.describe.configure({ mode: 'serial' });
test.use({ viewport: { width: 1280, height: 900 } });

// Unique per run, so the duplicate check does not trip over an earlier run.
const roll = `PW${Date.now().toString().slice(-8)}`;
const applicant = `Playwright Applicant ${roll}`;
const pdf = Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n');

async function signIn(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Password').fill(password!);
  await page.locator('main').getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function fillApplication(page: Page) {
  await page.getByLabel('Name').fill(applicant);
  await page.getByLabel('Roll number').fill(roll.toLowerCase());
  await page.getByLabel('Year of study').selectOption('2');
  await page.getByLabel('Contact email').fill(`${roll}@Example.com`);
  await page.getByLabel('What do you know about TES?').fill('TES runs the society website and weekly tech news.');
  await page.getByLabel('What contributions have you made to TES so far?').fill('None yet. I have read the contribution guide and set up the site locally.');
  await page.getByLabel('What work would you like to showcase?').fill('https://example.org/portfolio: a site I built for my hostel fest.');
  await page.getByLabel('How would you like to contribute to TES?').fill('Add keyboard shortcuts help to the command menu. First step: open an issue.');
  await page.getByRole('group', { name: 'Which roles are you applying for?' }).getByText('Technical team').click();
  await page.getByRole('group', { name: 'Which roles are you applying for?' }).getByText('Design').click();
  await page.getByRole('group', { name: 'Which domain would you like to work in?' }).getByText('Web Development').click();
  await page.getByLabel('How many hours can you realistically give each week?').fill('5');
  await page.getByText('A mix of both').click();
  await page.getByRole('radiogroup', { name: 'Are you part of any other club?' }).getByText('Yes').click();
  await page.getByLabel('Which clubs, and what do you do there?').fill('Robotics club, events team');
  await page.getByLabel(/I confirm these answers are my own/).check();
}

test('unsent answers survive a refresh, but consent is asked again', async ({ page }) => {
  await page.goto('/join');
  await fillApplication(page);
  await page.reload();
  await expect(page.getByLabel('Name')).toHaveValue(applicant);
  await expect(page.getByLabel('Year of study')).toHaveValue('2');
  await expect(page.getByLabel('How would you like to contribute to TES?')).toHaveValue(/keyboard shortcuts/);
  await expect(page.getByRole('checkbox', { name: /^Design/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Web Development' })).toBeChecked();
  await expect(page.getByLabel('Which clubs, and what do you do there?')).toHaveValue('Robotics club, events team');
  await expect(page.getByLabel(/I confirm these answers are my own/)).not.toBeChecked();
});

test('an applicant sees what is missing, then sends the form once', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Writes shared data; run once.');
  await page.goto('/join');
  await expect(page.locator('.join-question .join-weight[data-level="high"]').first()).toBeVisible();
  // Weights stay private; only labels are shown.
  await expect(page.locator('main')).not.toContainText(/weight\s*\d/i);

  await page.getByRole('button', { name: 'Send application' }).click();
  await expect(page.locator('.join-message')).toHaveText('Check the highlighted fields.');
  await expect(page.locator('#name-error')).toHaveText('Required.');
  await expect(page.locator('#roles-error')).toHaveText('Choose at least one role.');

  await fillApplication(page);
  await page.getByLabel('Name').fill('');
  await page.getByRole('button', { name: 'Send application' }).click();
  await expect(page.locator('#name-error')).toHaveText('Required.');
  // What was typed and chosen survives the round trip.
  await expect(page.getByRole('checkbox', { name: /Technical team/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /^Design/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Web Development' })).toBeChecked();
  await expect(page.getByLabel('Year of study')).toHaveValue('2');
  await expect(page.getByLabel('Which clubs, and what do you do there?')).toHaveValue('Robotics club, events team');
  await page.getByLabel('Name').fill(applicant);
  await page.getByLabel('Resume').setInputFiles({ name: 'resume.pdf', mimeType: 'application/pdf', buffer: pdf });
  await page.getByRole('button', { name: 'Send application' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thank you, Playwright.');
  await page.screenshot({ path: 'test-results/join-sent.png' });

  // Sending clears the saved answers.
  await page.goto('/join');
  await expect(page.getByLabel('Name')).toHaveValue('');
  await fillApplication(page);
  await page.getByRole('button', { name: 'Send application' }).click();
  await expect(page.locator('#rollNumber-error')).toContainText('We already have an application from this roll number');
});

test('admins review an application, override a score, and delete it', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Writes shared data; run once.');
  await signIn(page);
  await page.goto('/admin/applications');
  const row = page.locator('tr', { hasText: applicant });
  await expect(row).toContainText(roll);
  await expect(row).toContainText('Technical team, Design');
  await expect(row).toContainText('Web Development');
  await expect(row).toContainText('5 h / week');
  await expect(row).toContainText('Pending');
  await page.screenshot({ path: 'test-results/admin-applications.png', fullPage: true });

  await row.getByRole('link', { name: applicant }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(applicant);
  await expect(page.locator('main')).toContainText('a site I built for my hostel fest');
  await expect(page.locator('main')).toContainText('Other clubs: Yes: Robotics club, events team');
  await expect(page.getByRole('link', { name: 'https://example.org/portfolio' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Open resume/ })).toBeVisible();
  // The email and checks run after the response; give them a moment.
  await expect(async () => {
    await page.reload();
    await expect(page.locator('.admin-evidence')).toContainText('Resume attached.');
  }).toPass({ timeout: 15_000 });

  await page.getByLabel('Your score for Understanding of TES, 0 to 10').fill('11');
  await page.getByRole('button', { name: 'Save review' }).click();
  await expect(page.locator('#score_knowledge-error')).toHaveText('Use 0 to 10.');

  await page.getByLabel('Your score for Understanding of TES, 0 to 10').fill('7');
  await page.getByLabel('Your score for Plan to contribute, 0 to 10').fill('8');
  await page.getByLabel('Status').selectOption('shortlisted');
  await page.getByLabel('Notes').fill('Good first issue candidate.');
  await page.getByRole('button', { name: 'Save review' }).click();
  await expect(page.locator('.admin-message')).toHaveText('Review saved.');
  await expect(page.getByLabel('Status')).toHaveValue('shortlisted');
  await page.screenshot({ path: 'test-results/admin-application.png', fullPage: true });

  await page.goto('/admin/applications?status=shortlisted');
  await expect(page.locator('tr', { hasText: applicant })).toContainText('Shortlisted');

  await page.locator('tr', { hasText: applicant }).getByRole('link', { name: applicant }).click();
  await page.getByRole('button', { name: 'Delete application' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page).toHaveURL(/\/admin\/applications$/);
  await expect(page.locator('tr', { hasText: applicant })).toHaveCount(0);
});

test('the rubric shows applicants labels that follow the weights', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Writes shared data; run once.');
  await signIn(page);
  await page.goto('/admin/applications/settings');
  const weight = page.getByLabel('Weight for Resume, 0 to 10');
  const original = await weight.inputValue();
  await weight.fill('8');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.locator('.admin-message')).toContainText('Saved.');

  const form = await page.context().newPage();
  await form.goto('/join');
  await expect(form.locator('.join-question', { hasText: 'Resume' }).locator('.join-weight')).toContainText('High');
  await form.close();

  await weight.fill(original);
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.locator('.admin-message')).toContainText('Saved.');
});
