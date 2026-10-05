import assert from 'node:assert/strict';

const origin = process.env.TES_TEST_ORIGIN || 'http://127.0.0.1:8080';
const headers = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
};
let response;
for (let attempt = 0; attempt < 30; attempt++) {
  try { response = await fetch(origin, { signal: AbortSignal.timeout(1000) }); if (response.ok) break; } catch { /* Wait for nginx startup. */ }
  await new Promise(resolve => setTimeout(resolve, 1000));
}
assert.ok(response?.ok, 'nginx did not become ready within 30 seconds');
const html = await response.text();
const bundle = html.match(/src="([^"]+\.js)"/)?.[1];
const css = html.match(/href="([^"]+\.css)"/)?.[1];
assert.ok(bundle && css, 'Production bundle and stylesheet must exist');
const cssResponse = await fetch(new URL(css, origin), { signal: AbortSignal.timeout(10000) });
const font = (await cssResponse.text()).match(/url\(([^)]+\.woff2)\)/)?.[1]?.replace(/["']/g, '');
assert.ok(font, 'Self-hosted font must exist');
for (const [path, status, cache] of [
  ['/', 200, undefined],
  [bundle, 200, '31536000'],
  [css, 200, '31536000'],
  [new URL(font, new URL(css, origin)).pathname, 200, '31536000'],
  ['/assets/compass.svg', 200, '604800'],
  ['/assets/missing.png', 404, undefined],
  ['/about/', 200, undefined],
  ['/articles/', 200, undefined],
]) {
  const result = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(10000) });
  assert.equal(result.status, status, path);
  for (const [key, value] of Object.entries(headers)) assert.equal(result.headers.get(key), value, `${path}: ${key}`);
  assert.match(result.headers.get('content-security-policy') || '', /script-src 'self'/);
  assert.match(result.headers.get('content-security-policy') || '', /frame-ancestors 'none'/);
  assert.match(result.headers.get('permissions-policy') || '', /camera=\(\)/);
  assert.equal(result.headers.get('server'), 'nginx', 'Server must not disclose its version');
  if (cache) assert.match(result.headers.get('cache-control') || '', new RegExp(`max-age=${cache}`));
}
console.log('Container HTTP checks passed: HTML, JS, CSS, font, image, legacy routes, and 404 headers.');
