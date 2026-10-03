# The Enigma Society website

The official website for The Enigma Society at ABV-IIITM Gwalior. This redesign centers the society's compass mark, open-source work, knowledge, events, faculty coordinators, and student members.

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

## Content and design

- `TES-frontend/src/data.ts`: members, projects, articles, events, and official links.
- `TES-frontend/src/App.tsx`: section content and interactions.
- `TES-frontend/src/styles.css` and `tailwind.config.ts`: visual system and responsive behavior.
- `TES-frontend/public/assets/`: TES compass, wordmark, and team portraits.

The source is MIT licensed. Production dependencies use permissive software or font licenses. The license check also permits the development-only Python-2.0 and BlueOak-1.0.0 licenses, and CC-BY-4.0 browser-compatibility data. The latter is not shipped as site content. See `TES-frontend/scripts/check-licenses.mjs` for the enforced policy. Society media is from the existing repository and supplied club assets; review image rights before redistributing outside TES.

For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).
