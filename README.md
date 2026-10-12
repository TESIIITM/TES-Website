# The Enigma Society website

The website of The Enigma Society (TES) at ABV-IIITM Gwalior, with a content dashboard for the people who run it.

This is the **Next.js and Supabase migration** of [TESIIITM/TES-Website](https://github.com/TESIIITM/TES-Website). The original is a static React and Vite app whose content lives in `src/data.ts`. Here the same site reads its content from a Postgres database. Society maintainers can add faculty coordinators and members, post announcements, curate the reading list, and update links from `/admin`, without editing code.

The public site is meant to look and behave exactly like the original. Its stylesheet is carried over unchanged, and the original browser regression suite runs here without modification.

## Stack

- [Next.js 16](https://nextjs.org) App Router with React 19 and TypeScript
- [Supabase](https://supabase.com): Postgres with row level security, Auth for admins, and Storage for portraits
- Custom CSS from the original site, plus Motion, Radix Dialog, and Lucide
- Zod for input validation, Vitest for unit tests, and Playwright for browser tests
- pnpm

## Getting started

Use Node.js 22 or newer and pnpm (`corepack enable` will provide the pinned version).

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. With no Supabase variables set, the site renders its bundled content from `src/lib/content/fallback.ts`, and the dashboard explains how to connect a database. That is enough for work on the public pages.

### With a local database

The Supabase CLI is a dev dependency, and it runs the stack in Docker.

```sh
pnpm db:start          # Postgres, Auth, Storage, and Studio; applies migrations and seed.sql
cp .env.example .env.local
```

Put the API URL and publishable key printed by `db:start` into `.env.local`, then restart `pnpm dev`. Studio runs at http://127.0.0.1:54323.

### Creating an admin

Public sign-up is disabled. Every admin needs a user account and a row in `admin_users`:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'maintainer@example.com';
```

Remove the row to revoke access.

**Without email.** Inviting people needs custom SMTP, because Supabase only lets you edit email templates once it is set up. Until then, create the user under **Authentication → Users → Add user → Create new user**, tick **Auto Confirm User**, give them a temporary password of at least 12 characters, and run the insert above. They change the password under **Password** in the dashboard. If someone forgets theirs, set a new temporary one in the SQL editor:

```sql
update auth.users
set encrypted_password = extensions.crypt('a-new-temporary-password', extensions.gen_salt('bf'))
where email = 'maintainer@example.com';
```

**With SMTP.** Copy `supabase/templates/invite.html` and `recovery.html` into **Authentication → Emails**. Then invite people under **Add user → Send invitation** and run the insert above; they open the link, choose a password, and land in the dashboard. Invite links work once and expire after an hour. **Send password recovery** resets a forgotten password the same way.

On a local stack the emails arrive in Mailpit at http://127.0.0.1:54324.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` / `pnpm typecheck` | ESLint, and TypeScript including generated route types |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | Browser tests against the production build, on desktop and mobile. Run `pnpm build` first, and `pnpm test:install` once. Dashboard tests also run when `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` are set for a local admin. |
| `pnpm verify:licenses` / `pnpm verify:security` | Dependency license policy and production audit |
| `pnpm db:start` / `pnpm db:stop` / `pnpm db:reset` | Local Supabase stack. `db:reset` reapplies migrations and seed data. |
| `pnpm db:types` | Regenerate `src/lib/supabase/database.types.ts` after a schema change |

## How it fits together

```
src/
  app/
    page.tsx                 Public site: loads content on the server, renders <SiteShell>
    admin/login/             Sign in
    admin/(dashboard)/       Members, announcements, stories, domains, links
  components/site/           The public site, one component per section
  components/admin/          Form fields, tables, and dialogs for the dashboard
  lib/content/               Content types, Supabase queries, fallback content
  lib/supabase/              Clients for the server, the proxy, and cached public reads
  lib/validation.ts          Zod schemas shared by every admin form
  proxy.ts                   Per-request CSP nonce, session refresh, and /admin gate
  styles/site.css            The original stylesheet, unchanged
supabase/
  migrations/                Schema, row level security, and the portraits bucket
  seed.sql                   The site's current content
tests/unit, tests/e2e
```

**Reading content.** The home page fetches everything in one cached query (`getSiteContent`), tagged `site-content`. Visitors share that cache, so a page view does not hit the database.

**Writing content.** Every admin form posts to a Server Action. The action checks the session (`requireAdmin`), validates input with Zod, writes as the signed-in user, and then expires the `site-content` tag, so changes appear on the next page load.

**Access control** is enforced in the database. Row level security allows public reads of published rows only. Every write requires a row in `admin_users`, and that includes uploads to the `portraits` bucket. The proxy redirect and the server-side checks keep non-admins out of the UI, but they are not the security boundary.

## Content model

| Table | Shown in |
| --- | --- |
| `members` | Meet the collective: faculty coordinators, then student members, in `sort_order` |
| `announcements` | Gather: the newest published one is featured, and up to three earlier ones are listed below it |
| `stories` | Learn: the reading list. Each `category` becomes a filter, and `slug` keys readers' saved lists. |
| `domains` | Build → Explore the stack, numbered in `sort_order` |
| `site_settings` | One row of social, repository, and contact links |

## Security

- A nonce-based Content Security Policy is applied to every page by `src/proxy.ts`, together with frame, MIME, referrer, and permissions headers from `next.config.ts`.
- Uploaded portraits are checked by file signature (JPEG, PNG, or WebP) and limited to 2 MB, in the app and again in the bucket configuration.
- No service-role key is used anywhere. The app only ever holds the publishable key and the signed-in admin's session.

## Deployment

Any Next.js host works. On Vercel:

1. Create a Supabase project, then link it and push the schema with `pnpm exec supabase link` and `pnpm exec supabase db push`. Run `supabase/seed.sql` in the SQL editor once to import the current content.
2. In the Supabase dashboard, turn off **Allow new users to sign up** under Authentication. Leave the Email provider itself enabled, because admins sign in with it.
3. Under **Authentication → URL Configuration**, set **Site URL** to the site's address. Invite and recovery links are built from it.
4. Under **Authentication → Emails**, replace the **Invite user** and **Reset password** templates with `supabase/templates/invite.html` and `recovery.html`. The defaults sign people in without asking for a password.
5. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the Vercel project, then deploy.

The original `/about/` and `/articles/` URLs redirect to their sections.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The source is MIT licensed. The browser reset keeps its Tailwind Preflight notice in `public/licenses/tailwind-preflight.txt`. Society media comes from the original repository; check image rights before reusing it outside TES.

Contact: [tes@iiitm.ac.in](mailto:tes@iiitm.ac.in)
