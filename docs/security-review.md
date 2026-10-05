# Security and navigation review — issues #33 and #34

Reviewed against upstream `94cf218` on 5 October 2026. Contributed by @jwalith4418-Mj.

## Dependency evidence

The initial full `npm audit` reported eight affected dependency nodes (seven high, one low). These were build/development dependencies; the exported website does not run Vite, PostCSS, or a glob parser. They still need remediation because contributors run the toolchain.

- Update Vite 7.3.1 → 7.3.6, PostCSS 8.5.6 → 8.5.29, and locked esbuild 0.27.3 → 0.28.2. Vite's declared dependency range accepts esbuild 0.28; no forced override is used.
- Remove the unused Tailwind 3 compiler, which brings Braces through its glob/watch dependencies. Braces 3.0.3 has no patched release for [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). The site uses custom CSS; a local baseline and `sr-only` utility retain its rendering and accessibility. Preserve the MIT Preflight notice in exported assets.
- Tailwind 4 was evaluated but excluded because its Lightning CSS tooling uses MPL-2.0, outside this repository's permissive license policy.
- Full audit after the final lockfile: **zero known vulnerabilities**. This is a dated advisory check, not a guarantee against future vulnerabilities.

## Issue #33 findings

| Finding | Resolution |
| --- | --- |
| VULN-01 dependency advisories | Patch Vite/PostCSS/esbuild and eliminate the unpatched Braces dependency chain. CI audits all dependencies at severity low or above. |
| VULN-02 public dev binding | Dev/preview default to loopback. Document explicit LAN opt-in; production uses static output. |
| VULN-03 response headers | CSP, frame protection, MIME protection, referrer policy, Permissions Policy, COOP and CORP in Nginx and both Vercel configurations. Keep all Nginx `add_header` directives at server scope so asset cache rules retain them. |
| VULN-04 root runtime | Digest-pinned official unprivileged Nginx image; explicit UID/GID 101. Document read-only filesystem, temporary `/tmp`, no added capabilities and no privilege escalation. |
| VULN-05 workflow permissions | Build has only contents-read; Pages/OIDC writes belong only to the deployment job. |
| VULN-06 mutable actions | Pin all four existing actions to verified upstream release-tag commit SHAs. Dependabot maintains action pins and container digests. |
| VULN-07 health check | Add an HTTP health check and CI smoke check. |
| VULN-08 version disclosure | Disable Nginx version tokens. HTTP tests verify the Server header contains no version. |
| VULN-09 local storage | Theme initialization already validated `light` and otherwise chose `dark`; the report's unchecked theme cast is absent on current main. Add regression coverage. Filter saved articles to unique known IDs; test invalid JSON, invalid values and disabled storage. |
| VULN-10 dependency maintenance | Weekly npm/actions/Docker update configuration; CI security audit. The license check evaluates lockfile declarations, not independent license authenticity. Retain upstream license notices and review dependency updates. |

CSP permits inline **styles** for Motion/Radix; it does not permit inline scripts or eval. Images permit `data:` for the existing CSS texture. External community links are ordinary navigations, not remote runtime dependencies.

HSTS is configured for Vercel's HTTPS responses. The HTTP-only Nginx container does not terminate TLS: its external HTTPS proxy must configure HSTS. GitHub Pages controls response headers; this repository cannot apply Nginx/Vercel headers there. Sites also controls its own hosting headers. These platform boundaries are documented, not presented as solved by a static bundle.

## Issue #34 behavior

All tab changes push a history entry only when the hash changes. Reselecting the active tab adds no entry. Back/Forward restores the corresponding selected tab, panel, URL and section; returning to the initial URL restores Home. Direct links, reloads, keyboard changes and header/command navigation use the same behavior. Tab clicks retain their current scroll position.

Browser QA also found that the command menu advertised “learn” without matching it. Include route names in the search and give its input a meaningful accessible name.

## Repeatable validation

From `TES-frontend`: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run verify:licenses`, `npm run verify:security`, `npm run build`, `npm run test:install`, `npm test`.

The committed suite checks 14 cases across 1440×900 desktop and 390×844 mobile. It covers the reported history sequence, Forward, duplicate selection, keyboard focus, deep links/reloads, storage recovery/persistence, command navigation, search, event disclosure, images, overflow and runtime errors.

Local runtime verification uses the Nginx binary from the pinned image with the repository's server configuration and adjusted local filesystem paths. HTTP checks cover HTML/JS/CSS/fonts/images, both legacy routes and 404 responses. Browser checks under CSP cover navigation, themes and redirects without violations. Repeat desktop/mobile navigation, images and legacy redirects under `/TES-Website/` to verify repository-subpath hosting. Docker is not available in this workspace, so the complete image build, non-root execution and read-only startup are delegated to the committed container CI job; do not treat those as locally executed checks.
