const OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPOSITORY = /^[A-Za-z0-9._-]{1,100}$/;

/** `owner/name` from what an admin pastes: `owner/name` or any github.com link into the repository. */
export function parseRepositoryName(input: string): string | null {
  let path = input.trim();
  if (/^https:\/\//i.test(path)) {
    let url: URL;
    try {
      url = new URL(path);
    } catch {
      return null;
    }
    if (!/^(www\.)?github\.com$/i.test(url.hostname)) return null;
    path = url.pathname;
  }
  const [owner, name] = path.replace(/^\/+/, '').replace(/\.git$/, '').split('/');
  return owner && name && OWNER.test(owner) && REPOSITORY.test(name) && name !== '.' && name !== '..' ? `${owner}/${name}` : null;
}

/** GitHub logins from a list separated by commas, spaces, or lines; `@` prefixes are dropped. */
export function parseLogins(input: string): { logins: string[]; invalid: string[] } {
  const entries = input.split(/[\s,]+/).map((entry) => entry.replace(/^@/, '')).filter(Boolean);
  const logins = [...new Set(entries.filter((entry) => OWNER.test(entry)))];
  return { logins, invalid: entries.filter((entry) => !OWNER.test(entry)) };
}
