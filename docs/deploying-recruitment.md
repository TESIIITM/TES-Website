# Deploying JOIN TES

How to take the recruitment form (`/join`) and its review dashboard live on the hosted site, and how to run a recruitment round with it. For what the feature does, see [Recruitment](../README.md#recruitment-join-tes) in the README.

The site deploys through Vercel's GitHub integration: every merge to `main` goes to production at https://the-enigma-society.vercel.app. Pull requests get a preview deployment.

## What you need

| | Who usually has it |
| --- | --- |
| Admin access to the hosted Supabase project | Maintainers |
| Access to the Vercel project's settings | Maintainers |
| Sign-in to `tes@iiitm.ac.in` | Society coordinators |
| A Google account TES owns, for the Gemini key (optional) | Society coordinators |

Do the steps in this order. Step 3 must happen **before** the code is merged.

## 1. Email: an App Password for tes@iiitm.ac.in

`iiitm.ac.in` runs on Google Workspace, so confirmations are sent through `smtp.gmail.com`. The account password will not work; Google requires an App Password.

1. Sign in to `tes@iiitm.ac.in` and open **Google Account → Security**.
2. Turn on **2-Step Verification** if it is off.
3. Open https://myaccount.google.com/apppasswords, create one named `TES website`, and copy the 16 characters (without spaces).

If the App Passwords page says the setting is unavailable, the institute's Workspace admin has turned it off. Ask IIITM IT to allow App Passwords for this account. Until then you can deploy without email: applications still save, confirmations are marked **Email not set up**, and an admin can send them later from each application's page.

Keep the App Password with one or two coordinators. If someone with access leaves, revoke it on the same page and create a new one.

## 2. AI review: a Gemini API key (optional)

The form and dashboard work without it; reviewers then score by hand.

1. Sign in to https://aistudio.google.com with an account TES owns. A college Workspace account may have AI Studio turned off; a plain Gmail account made for the society works.
2. Choose **Get API key → Create API key**, and let it create a project.
3. Do **not** turn on billing for that project. Without billing you stay on the free tier; when its rate limit is hit, an evaluation fails and can be rerun.

Check the key from a terminal before using it (set `GEMINI_API_KEY` in `.env.local` first):

```bash
set -a; . ./.env.local; set +a; curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent" -H "x-goog-api-key: $GEMINI_API_KEY" -H "content-type: application/json" -d '{"contents":[{"parts":[{"text":"Reply with the word OK"}]}]}'
```

A reply containing `"text": "OK"` means it works. `API key not valid` means the key was copied wrongly.

The app uses `gemini-flash-lite-latest`, Google's alias for the current Flash-Lite model. On the free tier it evaluates an application in a few seconds; full Flash models were measured at one to three minutes, long enough to be cut off on the host.

On the free tier Google may use requests to improve its products. The app never sends an applicant's name, roll number, or email, strips email addresses and phone numbers from answers, and the form tells applicants that reviewers may use AI assistance.

## 3. Database: apply the migration

This adds the `applications`, `recruitment_criteria`, and `recruitment_settings` tables and the private `resumes` bucket. It only adds things, so it is safe to apply before the code ships. If the code ships first, the admin overview fails because it counts applications.

From a checkout of the branch, linked to the hosted project:

```bash
pnpm exec supabase link --project-ref <your-project-ref>
```

```bash
pnpm exec supabase db push
```

Or open the Supabase dashboard's **SQL editor**, paste `supabase/migrations/20261019000000_recruitment.sql`, and run it once.

Check under **Table Editor** that the three tables exist and that `recruitment_criteria` has seven rows, and under **Storage** that a private `resumes` bucket exists.

## 4. Vercel: environment variables

In **Vercel → the project → Settings → Environment Variables**, add these for **Production only**. Leaving them off Preview means a pull request's preview shows "Applications are closed" instead of writing test entries into the real database.

| Name | Value |
| --- | --- |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → **Secret keys**. Never prefix it with `NEXT_PUBLIC_`. |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `tes@iiitm.ac.in` |
| `SMTP_PASS` | The App Password from step 1 |
| `MAIL_FROM` | `Team TES <tes@iiitm.ac.in>` |
| `AI_EVAL_ENABLED` | `true`, only if you did step 2 |
| `GEMINI_API_KEY` | The key from step 2 |

`MAIL_REPLY_TO` and `GEMINI_MODEL` are optional; see `.env.example`.

Vercel applies new variables to the next deployment only. If you add or change them after the merge, redeploy from **Deployments → ⋯ → Redeploy**.

## 5. Merge and deploy

Open the pull request, let CI pass, and merge. Vercel builds `main` and publishes it within a few minutes.

## 6. Check it on the live site

1. Open https://the-enigma-society.vercel.app and confirm the **Join TES** button is in the header and goes to `/join`.
2. Submit one application with your own email and a roll number you will not reuse, such as `TEST-0001`.
3. Confirm the confirmation email arrives (check spam the first time).
4. In `/admin/applications`, open it: the confirmation email should read **Sent**, the automatic checks should be listed, and, with AI on, the evaluation should appear within a minute.
5. Delete the test application from its page.

## Running a recruitment round

- **Share the form** with the **Copy form link** button on the Applications page. The link is `https://the-enigma-society.vercel.app/join`.
- **Open or close it** under **Applications → Form & rubric → Accept applications**. Closing takes effect at once, and the page tells visitors applications are closed.
- **Technical domains** and **rubric weights** are on the same page. Applicants pick any number of roles: technical team (any year), mentor (2nd year and up), domain lead (3rd year and up), and Operations, Design, or Promotions (any year). If they pick a technical role, they also choose up to three domains; mentors can also choose General mentorship. They are also asked whether they are in other clubs, which is not scored. Weights run from 0 to 10; applicants see only High (7+), Medium (4–6), or Low (below 4). Changing a weight rescores every application.
- **Reviewing**: an admin's score for a criterion always beats the AI's and the automatic one. The AI never changes a status; only people do. Treat its scores as a first pass: it tends to be generous.
- **Linked GitHub accounts** are checked for contributions to the TES repositories, but the check cannot prove the account belongs to the applicant. Confirm ownership before relying on it.
- **Applicants are not emailed** when their status changes. Contact shortlisted and selected students yourselves.
- **After the round**, delete applications you no longer need, or any a student asks to have removed. Deleting removes the answers and the resume.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| `/join` says applications are closed | Check **Accept applications** is on. If it is, `SUPABASE_SECRET_KEY` is missing in Production; add it and redeploy. |
| The Applications page warns the form cannot accept applications | Same: `SUPABASE_SECRET_KEY` is not set. |
| Admin overview errors after deploying | The migration was not applied. Do step 3. |
| Email **Failed** with `Invalid login` or `Application-specific password required` | `SMTP_PASS` is the account password or a revoked App Password. Create a new one, update Vercel, redeploy, then **Retry email**. |
| Email **Email not set up** | `SMTP_HOST` or `MAIL_FROM` is missing. |
| AI **Failed** with `API key not valid` | Fix `GEMINI_API_KEY` and redeploy, then **Run AI**. |
| AI **Failed** with `Gemini answered 429` | The free tier's rate limit. Wait a minute and **Run again**. |
| AI or email stuck on **Running…** / **Sending…** | The host stopped the work part-way. After five minutes a **Retry** button appears. |
| A student says they cannot apply again | One application per roll number and per email. Delete the old one if they need to resubmit. |

## Rolling back

To stop taking applications, turn off **Accept applications**; nothing else needs to change. To remove the feature from the site, revert the merge commit on `main`. The tables can stay; they are not readable without an admin session.
