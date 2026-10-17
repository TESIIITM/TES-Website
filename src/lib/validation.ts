import { z } from 'zod';
import { instagramPostUrl } from './admin/instagram-post';
import { youtubeVideoId } from './youtube';
import { weekStart } from './format';
import { parseLogins, parseRepositoryName } from './github-names';
import { ANSWER_MAX, COMMITMENTS, STATUSES, YEARS, type ApplicationStatus, type Commitment } from './recruitment/options';

const required = (max: number) =>
  z.string().trim().min(1, 'Required.').max(max, `Keep this under ${max} characters.`);

const optional = (max: number) =>
  z.string().trim().max(max, `Keep this under ${max} characters.`).transform((value) => value || null);

const HTTPS_MESSAGE = 'Use a full link starting with https://';
const httpsUrl = z.string().trim().pipe(z.url({ protocol: /^https$/, error: HTTPS_MESSAGE }));
const optionalHttpsUrl = z
  .string()
  .trim()
  .transform((value) => value || null)
  .pipe(z.url({ protocol: /^https$/, error: HTTPS_MESSAGE }).nullable());

const sortOrder = z.coerce.number({ error: 'Use a whole number.' }).int('Use a whole number.').min(0).max(9999);
const isoDate = z.iso.date({ error: 'Pick a date.' });

export const memberSchema = z.object({
  name: required(120),
  role: required(80),
  group: z.enum(['faculty', 'student'], { error: 'Choose faculty or student.' }),
  linkedinUrl: optionalHttpsUrl,
  sortOrder,
  isPublished: z.boolean(),
});

export const storySchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and single hyphens.')
    .max(80),
  title: required(200),
  category: required(40),
  summary: required(300),
  url: httpsUrl,
  publishedOn: isoDate,
  isPublished: z.boolean(),
});

export const domainSchema = z.object({
  title: required(80),
  detail: required(300),
  sortOrder,
});

export const techNewsSchema = z.object({
  url: httpsUrl,
  title: required(200),
  summary: optional(400),
  source: optional(80),
  imageSourceUrl: optionalHttpsUrl,
  // Any day picks its week; the row stores its Tuesday.
  weekOf: isoDate.transform(weekStart),
  sortOrder,
  isPublished: z.boolean(),
});

/** Medium's id for a post, the hex at the end of its link. */
export const mediumPostIdSchema = z.string().regex(/^[0-9a-f]{8,16}$/);

export const linkSchema = httpsUrl;

export const instagramLinkSchema = z
  .string()
  .transform((value, ctx) => instagramPostUrl(value) ?? (ctx.addIssue({ code: 'custom', message: 'Paste a link to an Instagram post or reel.' }), z.NEVER));

export const youtubeLinkSchema = z
  .string()
  .transform((value, ctx) => youtubeVideoId(value) ?? (ctx.addIssue({ code: 'custom', message: 'Paste a link to a YouTube video.' }), z.NEVER));

export const youtubeVideoSchema = z.object({
  url: youtubeLinkSchema,
  title: required(200),
  channel: optional(80),
  imageSourceUrl: optionalHttpsUrl,
  publishedOn: isoDate,
  isPublished: z.boolean(),
});

export const githubRepoSchema = z.object({
  repository: z
    .string()
    .transform((value, ctx) => parseRepositoryName(value) ?? (ctx.addIssue({ code: 'custom', message: 'Use owner/name or a github.com link to the repository.' }), z.NEVER)),
  title: optional(80),
  description: optional(400),
  headline: optional(60),
  headlineEmphasis: optional(60),
  isFeatured: z.boolean(),
  sortOrder,
  isPublished: z.boolean(),
});

export const githubSettingsSchema = z.object({
  showContributors: z.boolean(),
  heading: required(80),
  intro: optional(300),
  hiddenLogins: z.string().transform((value, ctx) => {
    const { logins, invalid } = parseLogins(value);
    if (invalid.length) ctx.addIssue({ code: 'custom', message: `Not a GitHub username: ${invalid.join(', ')}` });
    return logins;
  }),
  maxContributors: z.coerce.number({ error: 'Use a whole number.' }).int('Use a whole number.').min(1, 'Show at least one.').max(100, 'GitHub lists up to 100 per repository.'),
});

export const instagramPostSchema = z.object({
  url: instagramLinkSchema,
  caption: optional(300),
  imageSourceUrl: optionalHttpsUrl,
  postedOn: isoDate,
  isPublished: z.boolean(),
});

/** Both halves of a call to action, or neither. */
function requirePair(label: string | null, url: string | null, labelKey: string, urlKey: string, ctx: z.RefinementCtx) {
  if (label && !url) ctx.addIssue({ code: 'custom', path: [urlKey], message: 'Add a link for this button.' });
  if (url && !label) ctx.addIssue({ code: 'custom', path: [labelKey], message: 'Add a label for this button.' });
}

export const announcementSchema = z
  .object({
    label: required(60),
    title: required(80),
    titleEmphasis: optional(80),
    summary: required(600),
    details: optional(2000),
    primaryLabel: optional(60),
    primaryUrl: optionalHttpsUrl,
    secondaryLabel: optional(60),
    secondaryUrl: optionalHttpsUrl,
    publishedOn: isoDate,
    isPublished: z.boolean(),
  })
  .superRefine((value, ctx) => {
    requirePair(value.primaryLabel, value.primaryUrl, 'primaryLabel', 'primaryUrl', ctx);
    requirePair(value.secondaryLabel, value.secondaryUrl, 'secondaryLabel', 'secondaryUrl', ctx);
  });

export const settingsSchema = z.object({
  github: httpsUrl,
  repository: httpsUrl,
  contributionGuide: httpsUrl,
  medium: httpsUrl,
  instagram: httpsUrl,
  linkedin: httpsUrl,
  email: z.email('Enter an email address.'),
});

export const signInSchema = z.object({
  email: z.email('Enter your email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const MIN_PASSWORD_LENGTH = 12;

const newPasswordFields = {
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
    // Supabase hashes passwords with bcrypt, which ignores everything past 72 bytes.
    .refine((value) => new TextEncoder().encode(value).length <= 72, 'Keep this under 72 characters.'),
  confirmPassword: z.string(),
};

const passwordsMatch = (value: { password: string; confirmPassword: string }) => value.password === value.confirmPassword;
const mismatch = { path: ['confirmPassword'], message: 'The passwords do not match.' };

export const newPasswordSchema = z.object(newPasswordFields).refine(passwordsMatch, mismatch);

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, 'Enter your current password.'), ...newPasswordFields })
  .refine(passwordsMatch, mismatch);

// Recruitment ----------------------------------------------------------------

const answer = z
  .string()
  .trim()
  .min(20, 'Write at least a sentence or two.')
  .max(ANSWER_MAX, `Keep this under ${ANSWER_MAX} characters.`);

/** Built per request, since admins choose the departments on offer. */
export function applicationSchema(departments: string[]) {
  return z.object({
    name: required(120),
    rollNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9/_-]{3,30}$/, 'Use your roll number as printed on your ID card, e.g. 2024IMT-045.'),
    yearOfStudy: z.enum(YEARS.map((year) => year.value), { error: 'Choose your year of study.' }),
    email: z.string().trim().toLowerCase().pipe(z.email('Enter an email address you check.').max(254)),
    knowledge: answer,
    contributions: answer,
    showcase: answer,
    plan: answer,
    department: z.string({ error: 'Choose a department.' }).refine((value) => departments.includes(value), 'Choose a department.'),
    role: required(120),
    weeklyHours: z.coerce
      .number({ error: 'Enter a number of hours.' })
      .int('Use a whole number of hours.')
      .min(1, 'Enter at least one hour.')
      .max(40, 'Keep this to 40 hours or fewer.'),
    commitment: z.enum(COMMITMENTS.map((commitment) => commitment.value) as [Commitment, ...Commitment[]], { error: 'Choose one.' }),
    additionalInfo: optional(2000),
    consent: z.literal(true, { error: 'Please confirm to send your application.' }),
  });
}

const score = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : Number(value)))
  .pipe(z.number().int('Use a whole number from 0 to 10.').min(0, 'Use 0 to 10.').max(10, 'Use 0 to 10.').nullable());

/** A reviewer's decision. Scores arrive as `score_<criterion>` fields; an empty box means "not scored". */
export function applicationReviewSchema(criterionKeys: string[]) {
  return z.object({
    status: z.enum(STATUSES.map((status) => status.value) as [ApplicationStatus, ...ApplicationStatus[]], { error: 'Choose a status.' }),
    adminNotes: optional(5000),
    ...Object.fromEntries(criterionKeys.map((key) => [`score_${key}`, score])),
  });
}

export function recruitmentSettingsSchema(criterionKeys: string[]) {
  return z.object({
    isOpen: z.boolean(),
    departments: z.string().transform((value, ctx) => {
      const list = [...new Set(value.split('\n').map((line) => line.trim()).filter(Boolean))];
      if (list.length === 0) ctx.addIssue({ code: 'custom', message: 'Add at least one department.' });
      if (list.length > 30) ctx.addIssue({ code: 'custom', message: 'Keep this to 30 departments.' });
      if (list.some((entry) => entry.length > 80)) ctx.addIssue({ code: 'custom', message: 'Keep each department under 80 characters.' });
      return list;
    }),
    ...Object.fromEntries(criterionKeys.map((key) => [
      `weight_${key}`,
      z.coerce.number({ error: 'Use a whole number.' }).int('Use a whole number.').min(0, 'Use 0 to 10.').max(10, 'Use 0 to 10.'),
    ])),
  });
}
