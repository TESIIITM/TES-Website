# Contributing

Anyone can contribute to the TES website. You don't need to be a core member or in a particular year; we only look at the work.

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before getting involved.

## What you can work on

- Bugs: check the [`bug`](https://github.com/TESIIITM/TES-Website/labels/bug) label or report one you found
- UI/UX improvements (open an issue first, the public design is shared with the original site)
- Performance and accessibility
- Tests (`tests/unit` and `tests/e2e`)
- Docs, if something here confused you

If you're new, start with [`good first issue`](https://github.com/TESIIITM/TES-Website/labels/good%20first%20issue).

## Before you write code

1. Find an issue or open one. Every PR should link to an issue (typo fixes are fine without one).
2. Comment on the issue and ask to be assigned. Wait for a maintainer to assign you, especially for bigger changes, so we can agree on the approach first.
3. Work on one issue at a time. If there's no update for about a week we may unassign it so someone else can pick it up. Just comment if you need more time.

Please don't send PRs that only reformat code or bump dependencies. Dependabot takes care of updates.

## Setup

You'll need Node.js 22+, Git, and Docker if you're touching the dashboard or database.

```bash
git clone https://github.com/YOUR-USERNAME/TES-Website.git
cd TES-Website
git remote add upstream https://github.com/TESIIITM/TES-Website.git

corepack enable
pnpm install
pnpm dev
```

The site runs at http://localhost:3000 with bundled sample content, which is enough for most frontend work.

### Dashboard and database

```bash
pnpm db:start
cp .env.example .env.local   # paste in the API URL and publishable key from db:start
```

Create a local admin using the SQL under [Creating an admin](README.md#creating-an-admin) in the README (run it in Studio at http://127.0.0.1:54323), restart `pnpm dev`, and log in at `/admin`.

When you pull new changes, run `pnpm exec supabase migration up --local`. `db:start` doesn't apply migrations to a database that already exists, and dashboard saves will fail until you do.

## Branches and commits

Branch off an up-to-date `main`:

```bash
git checkout main
git pull upstream main
git checkout -b fix/footer-mobile-layout
```

Branch prefixes: `feat/`, `fix/`, `ui/`, `docs/`, `refactor/`, `test/`, `chore/`.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org), e.g. `fix: footer links wrap on mobile`. Lowercase, present tense. Don't commit `.env` files or anything secret.

### Database changes

- Add a new migration file in `supabase/migrations/`. Never edit one that's already merged.
- Apply it locally, run `pnpm db:types`, and commit the updated `database.types.ts`.
- New tables need row level security (public can read published rows, only admins can write). Copy the pattern from existing migrations.
- Mention in your PR that the migration needs to go to the hosted project before the code is deployed.

## Opening a PR

Run the same checks CI runs:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm verify:licenses
pnpm verify:security
pnpm build
pnpm test:install   # first time only
pnpm test:e2e
```

If you changed anything in the dashboard, also run the admin tests against your local database:

```bash
E2E_ADMIN_EMAIL=you@example.com E2E_ADMIN_PASSWORD=yourpassword pnpm test:e2e admin
```

Then open a PR against `main`:

- Title in the same format as commits (`fix: ...`)
- Fill in the template and add `Fixes #123`
- Screenshots for visual changes, desktop and mobile
- Keep it small and focused. Smaller PRs get reviewed faster.
- Open it as a draft if you want early feedback

## Review

- We try to review within a week. If it's been longer, feel free to ping `@dhananjay-123`.
- A PR needs one maintainer approval and green CI to merge.
- Please reply to review comments, and let the reviewer resolve them.
- We squash-merge, so don't worry about cleaning up your commits.
- PRs that go quiet for a month after review may be closed. You can reopen them later.

## Code style

- Functional components and hooks. Keep components on the server unless they need state or browser APIs.
- Use the existing CSS variables. Don't edit `src/styles/site.css`; new sections get their own stylesheet.
- Admin input goes through the schemas in `src/lib/validation.ts`, and every Server Action starts with `requireAdmin()`.
- If a database write fails, `console.error` the code and message and show the admin a simple message.
- No leftover `console.log` or commented-out code.
- Add tests for what you change where it makes sense.

## Reporting bugs

Use the [bug report form](https://github.com/TESIIITM/TES-Website/issues/new?template=BUG_REPORT.yml) and search existing issues first. Steps to reproduce, what you expected, and your browser/OS help a lot.

Security issues should **not** go in a public issue. See [SECURITY.md](SECURITY.md).

## Content

Members, announcements, stories, news, Instagram posts, videos, domains, repos, and links are all edited from the dashboard at `/admin`, so they don't need a PR. Open an issue or contact the society if something needs changing.

If you change the sample content, update `supabase/seed.sql` and `src/lib/content/fallback.ts` together.

## Questions

Ask in the issue you're working on and mention `@dhananjay-123`, or open a new issue. For anything about the society itself, email [tes@iiitm.ac.in](mailto:tes@iiitm.ac.in) or message [@tes_iiitm](https://www.instagram.com/tes_iiitm) on Instagram.
