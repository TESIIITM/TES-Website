import { describe, expect, it } from 'vitest';
import { announcementSchema, changePasswordSchema, memberSchema, newPasswordSchema, settingsSchema, storySchema, techNewsSchema } from '@/lib/validation';

const member = { name: 'Rohinth S', role: 'Club head', group: 'student', linkedinUrl: '', sortOrder: '2', isPublished: true };

describe('memberSchema', () => {
  it('trims text, coerces order, and turns an empty link into null', () => {
    const result = memberSchema.parse({ ...member, name: '  Rohinth S  ' });
    expect(result).toMatchObject({ name: 'Rohinth S', sortOrder: 2, linkedinUrl: null });
  });

  it('accepts only https profile links', () => {
    expect(memberSchema.safeParse({ ...member, linkedinUrl: 'http://linkedin.com/in/x' }).success).toBe(false);
    expect(memberSchema.safeParse({ ...member, linkedinUrl: 'javascript:alert(1)' }).success).toBe(false);
    expect(memberSchema.safeParse({ ...member, linkedinUrl: 'https://www.linkedin.com/in/srohinth/' }).success).toBe(true);
  });

  it('rejects unknown sections and fractional order', () => {
    expect(memberSchema.safeParse({ ...member, group: 'alumni' }).success).toBe(false);
    expect(memberSchema.safeParse({ ...member, sortOrder: '1.5' }).success).toBe(false);
  });
});

describe('storySchema', () => {
  const story = { slug: 'gsoc', title: 'GSoC', category: 'Open source', summary: 'A path in.', url: 'https://medium.com/x', publishedOn: '2026-06-01', isPublished: true };

  it('normalises the slug case and rejects malformed slugs', () => {
    expect(storySchema.parse({ ...story, slug: 'GSoC-26' }).slug).toBe('gsoc-26');
    for (const slug of ['has space', '-leading', 'double--hyphen', '']) {
      expect(storySchema.safeParse({ ...story, slug }).success).toBe(false);
    }
  });

  it('requires a real calendar date', () => {
    expect(storySchema.safeParse({ ...story, publishedOn: '2026-02-30' }).success).toBe(false);
  });
});

describe('announcementSchema', () => {
  const announcement = {
    label: 'Community announcement', title: 'Tech', titleEmphasis: 'Lekhan.', summary: 'Write.', details: '',
    primaryLabel: '', primaryUrl: '', secondaryLabel: '', secondaryUrl: '', publishedOn: '2026-09-01', isPublished: true,
  };

  it('allows an announcement without buttons', () => {
    expect(announcementSchema.parse(announcement)).toMatchObject({ details: null, primaryUrl: null, secondaryLabel: null });
  });

  it('reports a button with a label but no link on the link field', () => {
    const result = announcementSchema.safeParse({ ...announcement, primaryLabel: 'Register' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(['primaryUrl']);
  });

  it('reports a link without a label on the label field', () => {
    const result = announcementSchema.safeParse({ ...announcement, secondaryUrl: 'https://example.org/rules' });
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(['secondaryLabel']);
  });
});

describe('settingsSchema', () => {
  it('requires every link and a valid email', () => {
    const links = { github: 'https://github.com/TESIIITM', repository: 'https://github.com/TESIIITM/TES-Website', contributionGuide: 'https://github.com/x', medium: 'https://medium.com/x', instagram: 'https://instagram.com/x', linkedin: 'https://linkedin.com/x', email: 'tes@iiitm.ac.in' };
    expect(settingsSchema.safeParse(links).success).toBe(true);
    expect(settingsSchema.safeParse({ ...links, email: 'not-an-email' }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...links, medium: '' }).success).toBe(false);
  });
});

describe('newPasswordSchema', () => {
  it('requires at least 12 characters and a matching confirmation', () => {
    expect(newPasswordSchema.safeParse({ password: 'short', confirmPassword: 'short' }).success).toBe(false);
    const mismatch = newPasswordSchema.safeParse({ password: 'a long enough password', confirmPassword: 'a long enough passw0rd' });
    expect(mismatch.error?.issues.map((issue) => issue.path[0])).toEqual(['confirmPassword']);
    expect(newPasswordSchema.safeParse({ password: 'a long enough password', confirmPassword: 'a long enough password' }).success).toBe(true);
  });

  it('rejects passwords bcrypt would silently truncate', () => {
    const tooLong = 'é'.repeat(37); // 37 characters, 74 bytes
    expect(newPasswordSchema.safeParse({ password: tooLong, confirmPassword: tooLong }).success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  it('needs the current password as well as a valid new one', () => {
    const change = { currentPassword: 'old password value', password: 'a long enough password', confirmPassword: 'a long enough password' };
    expect(changePasswordSchema.safeParse(change).success).toBe(true);
    expect(changePasswordSchema.safeParse({ ...change, currentPassword: '' }).error?.issues.map((issue) => issue.path[0])).toEqual(['currentPassword']);
    expect(changePasswordSchema.safeParse({ ...change, confirmPassword: 'something else' }).error?.issues.map((issue) => issue.path[0])).toEqual(['confirmPassword']);
  });
});

describe('techNewsSchema', () => {
  const item = { url: 'https://example.com/a', title: 'A', summary: '', source: ' ', imageSourceUrl: '', weekOf: '2026-10-15', sortOrder: '0', isPublished: true };

  it('stores the week as its Monday and empty optional fields as null', () => {
    expect(techNewsSchema.parse(item)).toMatchObject({ weekOf: '2026-10-12', summary: null, source: null, imageSourceUrl: null });
  });

  it('requires https for the link and the preview image', () => {
    expect(techNewsSchema.safeParse({ ...item, url: 'http://example.com' }).success).toBe(false);
    expect(techNewsSchema.safeParse({ ...item, imageSourceUrl: 'http://example.com/a.png' }).success).toBe(false);
  });
});
