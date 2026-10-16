# The Enigma Society website

The website of The Enigma Society (TES) at ABV-IIITM Gwalior, with a content dashboard for the people who run it.

This is the **Next.js and Supabase migration** of [TESIIITM/TES-Website](https://github.com/TESIIITM/TES-Website). The original is a static React and Vite app whose content lives in `src/data.ts`. Here the same site reads its content from a Postgres database. Society maintainers can add faculty coordinators and members, post announcements, curate the reading list, and update links from `/admin`, without editing code.

Beyond the original, the dashboard also runs a weekly tech news digest, Instagram post and YouTube video previews, and the GitHub repositories and contributors shown under Build. Each of those sections appears only once it has content, so an empty one leaves the page as it was.

The public site is meant to look and behave exactly like the original. Its stylesheet is carried over unchanged, and the original browser regression suite runs here without modification.

## Stack

- [Next.js 16](https://nextjs.org) App Router with React 19 and TypeScript
- [Supabase](https://supabase.com): Postgres with row level security, Auth for admins, and Storage for portraits and preview images
- The GitHub REST API for repository stats and contributors, read on the server and cached
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

Remove the row to revoke access. Deleting the user removes the row too.

**Without email.** Inviting people needs custom SMTP, because Supabase only lets you edit email templates once it is set up. Until then, create admins with a temporary password and send it to them yourself; they change it under **Password** in the dashboard.

This creates a confirmed account with a random 20-character password, makes it an admin, and shows the password once. Only its hash is stored, so copy it from the result. It fails with `users_email_partial_key` and changes nothing if the email already has an account.

```sql
with new_user as (
  select
    gen_random_uuid() as id,
    lower('maintainer@example.com') as email,
    translate(encode(extensions.gen_random_bytes(15), 'base64'), '+/', '-_') as password
),
created as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  )
  select
    '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
    extensions.crypt(password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  from new_user
  returning id
),
identity as (
  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select id::text, id, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true), 'email', now(), now(), now()
  from new_user
),
admin as (
  insert into public.admin_users (user_id)
  select id from created
)
select email, password from new_user;
```

For an account that already exists, or someone who forgot their password, this sets a new random password, confirms the account, and makes sure it is an admin:

```sql
with target as (
  select id, email, translate(encode(extensions.gen_random_bytes(15), 'base64'), '+/', '-_') as password
  from auth.users
  where email = 'maintainer@example.com'
),
reset as (
  update auth.users u
  set encrypted_password = extensions.crypt(t.password, extensions.gen_salt('bf')),
      email_confirmed_at = coalesce(u.email_confirmed_at, now()),
      updated_at = now()
  from target t
  where u.id = t.id
),
admin as (
  insert into public.admin_users (user_id)
  select id from target
  on conflict (user_id) do nothing
)
select email, password from target;
```

An empty result means no account has that email. You can also create a user under **Authentication → Users → Add user → Create new user** (tick **Auto Confirm User**) and run the first insert above.

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

To apply a new migration without wiping a local stack (and its admin accounts), use `pnpm exec supabase migration up --local` instead of `db:reset`.

## How it fits together

```
src/
  app/
    page.tsx                 Public site: loads content on the server, renders <SiteShell>
    admin/login/             Sign in
    admin/(dashboard)/       Members, announcements, stories, tech news, Instagram, videos,
                             domains, GitHub, links, and the admin's own password
  components/site/           The public site, one component per section
  components/admin/          Form fields, tables, dialogs, and the preview image picker
  lib/admin/                 Link previews, safe fetching of pasted links, image uploads
  lib/content/               Content types, Supabase queries, GitHub data, fallback content
  lib/github.ts              GitHub REST API client
  lib/supabase/              Clients for the server, the proxy, and cached public reads
  lib/validation.ts          Zod schemas shared by every admin form
  proxy.ts                   Per-request CSP nonce, session refresh, and /admin gate
  styles/site.css            The original stylesheet, unchanged
  styles/*.css               One stylesheet per section added since, built on its tokens
supabase/
  migrations/                Schema, row level security, and storage buckets, one file per change
  seed.sql                   The site's current content
tests/unit, tests/e2e
```

**Reading content.** The home page fetches everything in one cached query (`getSiteContent`), tagged `site-content`. Visitors share that cache, so a page view does not hit the database.

GitHub numbers are fetched separately and cached for an hour under the `github` tag; the dashboard's **Refresh from GitHub** expires it. If GitHub can't be reached, the Build panel renders without numbers, and a failed fetch is not cached. With no Supabase variables set, the site never calls GitHub.

**Writing content.** Every admin form posts to a Server Action. The action checks the session (`requireAdmin`), validates input with Zod, writes as the signed-in user, and then expires the `site-content` tag, so changes appear on the next page load.

**Access control** is enforced in the database. Row level security allows public reads of published rows only. Every write requires a row in `admin_users`, and that includes uploads to every storage bucket. The proxy redirect and the server-side checks keep non-admins out of the UI, but they are not the security boundary.

## Content model

| Table | Shown in |
| --- | --- |
| `members` | Meet the collective: faculty coordinators, then student members, in `sort_order` |
| `announcements` | Gather: the newest published one is featured, and up to three earlier ones are listed below it |
| `stories` | Learn: the reading list. Each `category` becomes a filter, and `slug` keys readers' saved lists. Posts in the Medium feed (from the Medium link, cached for an hour) are added automatically; a row with a post's link replaces its feed copy. |
| `domains` | Build → Explore the stack, numbered in `sort_order` |
| `tech_news` | This week in tech, between the Explorer and The People. Only the latest `week_of` (always a Tuesday) is shown. |
| `instagram_posts` | Gather: the four newest posts as cards under the announcements |
| `youtube_videos` | Learn: the three newest videos under the reading list |
| `github_repos` | Build: the featured repository's card, and the rest under More projects |
| `github_settings` | One row for the Build panel's contributors section: heading, intro, size, and hidden people |
| `site_settings` | One row of social, repository, and contact links, plus the Medium posts an admin hid |

**Adding links from the dashboard.** For tech news, Instagram, and videos, an admin pastes a link and the form fills in the title, caption or channel, date, and image from the page's own preview (YouTube's oEmbed endpoint for videos). The image is copied into Storage when the item is saved, so the site never loads images from other hosts. Some sites refuse requests from servers; the admin then fills the fields in and uploads an image.

## Security

- A nonce-based Content Security Policy is applied to every page by `src/proxy.ts`, together with frame, MIME, referrer, and permissions headers from `next.config.ts`.
- Uploaded images are checked by file signature (JPEG, PNG, or WebP) and limited to 2 MB, in the app and again in each bucket's configuration.
- Links pasted in the dashboard are fetched only for admins, only over https, with timeouts and size limits, and every redirect is checked so a link cannot point the server at a private or internal address.
- The only third-party frame allowed is the `youtube-nocookie.com` player, and it loads only when a visitor presses play.
- No service-role key is used anywhere. The app only ever holds the publishable key and the signed-in admin's session.

## Deployment

Any Next.js host works. On Vercel:

1. Create a Supabase project, then link it and push the schema with `pnpm exec supabase link` and `pnpm exec supabase db push`. Run `supabase/seed.sql` in the SQL editor once to import the current content.
2. In the Supabase dashboard, turn off **Allow new users to sign up** under Authentication. Leave the Email provider itself enabled, because admins sign in with it.
3. Under **Authentication → URL Configuration**, set **Site URL** to the site's address. Invite and recovery links are built from it.
4. Under **Authentication → Emails**, replace the **Invite user** and **Reset password** templates with `supabase/templates/invite.html` and `recovery.html`. The defaults sign people in without asking for a password.
5. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the Vercel project.
6. Optionally set `GITHUB_TOKEN`, a fine-grained token with no permissions. Without it GitHub allows 60 requests an hour per IP, which a shared host can use up; the Build panel then shows no numbers until the limit resets. When the token expires, replace it.
7. Deploy.

When a later change adds a migration, apply it to the hosted project (`supabase db push`, or paste it into the SQL editor) **before** deploying the code that reads the new tables, or the home page will fail to load.

The original `/about/` and `/articles/` URLs redirect to their sections.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The source is MIT licensed. The browser reset keeps its Tailwind Preflight notice in `public/licenses/tailwind-preflight.txt`. Society media comes from the original repository; check image rights before reusing it outside TES.

Contact: [tes@iiitm.ac.in](mailto:tes@iiitm.ac.in)
