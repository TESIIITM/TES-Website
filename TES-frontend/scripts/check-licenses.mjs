import { readFileSync } from 'node:fs';

const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const allowed = new Set(['MIT', 'Apache-2.0', 'ISC', 'BSD-3-Clause', 'BSD-2-Clause', '0BSD', 'OFL-1.1']);
// Tooling only: Python and Blue Oak are permissive software licenses;
// caniuse-lite is browser compatibility data licensed under CC BY 4.0.
const toolingOnly = new Set(['Python-2.0', 'BlueOak-1.0.0', 'CC-BY-4.0']);
const bad = Object.entries(lock.packages)
  .filter(([path]) => path.startsWith('node_modules/'))
  .filter(([, info]) => !allowed.has(info.license) && !(info.dev && toolingOnly.has(info.license)));

if (bad.length) {
  console.error('Dependencies outside the approved permissive license set:');
  for (const [path, info] of bad) console.error(`${path}: ${info.license ?? 'unknown'}`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${Object.keys(lock.packages).length - 1} locked packages. Runtime licenses are MIT, Apache-2.0, ISC, BSD, 0BSD, or OFL-1.1; permissive tooling-only exceptions are Python-2.0, BlueOak-1.0.0, and CC-BY-4.0 data.`);
}
