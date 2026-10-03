# The Enigma Society website

The official website for The Enigma Society (TES) at ABV-IIITM Gwalior. This redesign centers the society's compass mark, open-source work, knowledge, events, faculty coordinators, and student members.

## What is here

- A responsive single-page experience with Build, Learn, Gather, and Society sections.
- A pointer-aware compass illustration that pauses when offscreen, when the tab is hidden, and for reduced-motion preferences.
- Searchable society articles and a locally saved reading list; article links lead to the official Medium publication.
- Accessible keyboard navigation, a command menu (`Ctrl/⌘+K`), light/dark mode, and a contact dialog.
- Faculty coordinators above student members. Original TES imagery is served locally.
- Legacy `/about/` and `/articles/` URLs redirect to their corresponding sections.

The site is a static React + Vite + TypeScript application. Fonts and visual assets are bundled. There is no backend, analytics SDK, hosted font dependency, or proprietary frontend requirement.

## Develop and validate

Use Node.js 22 and run commands from `TES-frontend/`:

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm run verify:licenses
npm run build
```

`npm run preview` serves the production build locally. The output in `TES-frontend/dist/` can be hosted by any static server. Vite uses a relative base path, so the build works at a site root or a repository subpath. The GitHub Pages workflow builds and uploads that directory after changes reach `main`.

To self-host with Docker:

```sh
cd TES-frontend
docker build -t tes-website .
docker run --rm -p 8080:8080 tes-website
```

Open `http://localhost:8080`.

## GitHub Pages and Vercel

The same production build supports both hosts. Keep Vite's relative base (`./`) and use the `asset()` helper for public images; do not hard-code `/TES-Website/` or root-absolute image URLs. Section navigation uses URL hashes, so refreshing a section works at either base path.

- **GitHub Pages:** select **GitHub Actions** as the Pages source. The existing workflow installs locked dependencies with Node.js 22, builds the frontend, and deploys `TES-frontend/dist/`. Repository sites work under `/<repository-name>/`, and custom domains can serve the same files at `/`.
- **Vercel:** import the repository with either the repository root or `TES-frontend` as the Root Directory. Each directory has its own `vercel.json` with the matching install command, build command, and output directory. Use Node.js 22 or newer.
- **Legacy URLs:** `about/index.html` and `articles/index.html` are static redirect pages. They lead to `#about` and `#learn` at the current hosting base. Keep these files when deploying, and do not add a blanket SPA rewrite that overrides them.

Before deploying, check the home page and images, the Build/Learn/Gather tabs, theme switching, search/bookmarks, the command menu, and the legacy links at both `/` and `/TES-Website/`.

## Content and design

- `TES-frontend/src/data.ts`: members, projects, articles, events, and official links.
- `TES-frontend/src/App.tsx`: section content and interactions.
- `TES-frontend/src/styles.css` and `tailwind.config.ts`: visual system and responsive behavior.
- `TES-frontend/public/assets/`: TES compass, wordmark, and team portraits.

The source is MIT licensed. Production dependencies use permissive software or font licenses. The license check also permits the development-only Python-2.0 and BlueOak-1.0.0 licenses, and CC-BY-4.0 browser-compatibility data. The latter is not shipped as site content. See `TES-frontend/scripts/check-licenses.mjs` for the enforced policy. Society media is from the existing repository and supplied club assets; review image rights before redistributing outside TES.

For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).
