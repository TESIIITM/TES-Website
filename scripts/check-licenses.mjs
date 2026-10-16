import { execSync } from 'node:child_process';

// Licenses any installed package may use.
const permissive = new Set(['MIT', 'Apache-2.0', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD', 'OFL-1.1']);

// Reviewed exceptions, by package name, with the reason they are acceptable.
const exceptions = {
  production: {
    // Next.js image optimisation ships libvips as a separate, dynamically loaded binary.
    'Apache-2.0 AND LGPL-3.0-or-later': /^@img\/sharp-/,
    'LGPL-3.0-or-later': /^@img\/sharp-libvips-/,
    // Browser support data read at build time; not served as site content.
    'CC-BY-4.0': /^caniuse-lite$/,
  },
  development: {
    'Python-2.0': /^argparse$/,
    'BlueOak-1.0.0': /^minimatch$/,
    'CC-BY-4.0': /^caniuse-lite$/,
    'CC0-1.0': /^language-subtag-registry$/,
    // Unmodified build and test tooling; MPL obligations apply only to modified files.
    'MPL-2.0': /^(axe-core|lightningcss(-.+)?)$/,
  },
};

function listLicenses(scope) {
  const output = execSync(`pnpm licenses list --json --${scope === 'production' ? 'prod' : 'dev'}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  return JSON.parse(output);
}

const problems = [];
let checked = 0;
for (const scope of ['production', 'development']) {
  for (const [license, packages] of Object.entries(listLicenses(scope))) {
    for (const { name } of packages) {
      checked++;
      if (permissive.has(license) || exceptions[scope][license]?.test(name)) continue;
      problems.push(`${scope}: ${name} (${license})`);
    }
  }
}

if (problems.length) {
  console.error('Dependencies outside the approved license policy:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${checked} packages against the license policy.`);
}
