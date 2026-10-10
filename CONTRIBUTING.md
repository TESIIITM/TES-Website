# Contributing to TES Frontend

First off, thanks for taking the time to contribute. TES is built by the community, for the community. You do not need any role or position to contribute. Anyone can get involved.

---

## Our Philosophy

> *"The idea is simple: learn from each other and grow together."*

This repo follows the same principles as TES. No bias, transparency, and open feedback. What matters is your work, not your year or background.

---

## Ways to Contribute

You do not need to be a core member to contribute. Here are some ways you can help:

* Fix bugs. If you find something broken, open an issue or submit a fix.
* Improve UI or UX. If you have a better idea, suggest it or build it.
* Add content. Help keep the site updated with articles, events, or announcements.
* Improve performance. Optimize components and reduce load time.
* Write documentation. Make it easier for others to understand the codebase.
* Report issues. Even reporting a bug is useful.

---

## Getting Started

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/TES-Website.git

# 3. Move into the project
cd TES-Website/TES-frontend

# 4. Install dependencies
npm ci

# 5. Create a new branch
git checkout -b feat/your-feature-name

# 6. Make changes and commit
git add .
git commit -m "feat: describe what you did"

# 7. Push to your fork
git push origin feat/your-feature-name

# 8. Open a Pull Request
```

---

## Branch Naming

Use clear and simple names:

| Type      | Format          | Example                         |
| --------- | --------------- | ------------------------------- |
| Feature   | `feat/name`     | `feat/add-events-page`          |
| Bug fix   | `fix/name`      | `fix/footer-mobile-layout`      |
| UI change | `ui/name`       | `ui/improve-hero-section`       |
| Docs      | `docs/name`     | `docs/update-readme`            |
| Refactor  | `refactor/name` | `refactor/background-component` |

---

## Commit Messages

Keep it simple:

```
type: short description
```

Examples:

* feat: add newsletter section
* fix: broken navigation link
* ui: improve mobile layout
* docs: update setup instructions
* refactor: clean up Background.jsx

Write in lowercase and present tense.

---

## Pull Request Rules

Before opening a PR:

* Use Node.js 22 and make sure the project runs (`npm run dev`)
* Run `npm run lint`, `npm run typecheck`, `npm run verify:licenses`, `npm run verify:security`, `npm run build`, and `npm test` from `TES-frontend/`
* Run `npm run test:install` once, then `npm test` after building; verify desktop and mobile
* Pull latest changes from `main`
* Write a clear title and description
* Do not include unnecessary files like `.env` or `node_modules`

PRs will be reviewed by the team. Feedback will be direct and helpful.

---

## Code Style

* Use functional React components with hooks
* Reuse the existing custom CSS variables and component styles
* Keep components small and focused
* Use clear variable and function names
* Remove `console.log` before pushing
* Avoid leaving unused or commented code

---

## Reporting Bugs

When opening an issue, include:

1. Clear title
2. Steps to reproduce
3. Expected vs actual result
4. Screenshots if needed
5. Browser and OS

---

## Content Contributions

If you want to update content like team members, events, or articles:

* Open a PR with the changes
* Make sure the information is correct
* For team members, include name and role

If you create something good outside this repo, share it. TES highlights good work and gives proper credit.

---

## Code of Conduct

This repo follows the same three ideas:

**No Bias**
Work is judged on quality.

**Transparency**
Be open about what you are doing.

**Open Feedback**
Give and receive feedback respectfully.

---

## Questions

Reach out anytime:

* Email: [tes@iiitm.ac.in](mailto:tes@iiitm.ac.in)
* Instagram: [@TES_IIITM](https://www.instagram.com/tes_iiitm)
* LinkedIn: [The Enigma Society](https://www.linkedin.com/company/tes-the-enigma-society/)

---

*ABV-IIITM Gwalior · The Enigma Society*
