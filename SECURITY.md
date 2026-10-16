# Security

If you find a security issue, please **don't** open a public issue or PR.

Report it privately from the [Security tab](https://github.com/TESIIITM/TES-Website/security) → **Report a vulnerability**. If that isn't available, email [tes@iiitm.ac.in](mailto:tes@iiitm.ac.in) with "Security" in the subject.

Tell us what the problem is, how to reproduce it, and which page or file is affected. We'll try to reply within a few days and keep you posted until it's fixed. We're happy to credit you once it's fixed, or keep you anonymous if you prefer.

Only the current `main` branch (the live site) is supported.

Please test against a local setup (`pnpm db:start`), not the live site or its data. Things like denial of service, scanner output with no real impact, or bugs in Supabase/Vercel/GitHub themselves are out of scope.
