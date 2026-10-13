import { z } from 'zod';
import { instagramPostUrl } from './admin/instagram-post';
import { youtubeVideoId } from './youtube';
import { weekStart } from './format';

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
  // Any day picks its week; the row stores the Monday.
  weekOf: isoDate.transform(weekStart),
  sortOrder,
  isPublished: z.boolean(),
});

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
