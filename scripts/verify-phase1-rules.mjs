import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const eng = pkg.engines?.node;
if (!eng) {
  console.error('verify-phase1-rules: engines.node missing');
  process.exit(1);
}

/** Minimum major from engines.node (e.g. >=18 -> 18, >=10.15.3 -> 10). */
function minMajor(range) {
  const s = String(range).trim();
  const withoutOp = s.replace(/^(>=|>|<=|<|\^|~)\s*/, '');
  const m = withoutOp.match(/^(\d+)/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

const major = minMajor(eng);
if (major === null || major < 18) {
  console.error('verify-phase1-rules: engines.node minimum major must be >= 18, got:', eng);
  process.exit(1);
}

const rules = [
  '.cursor/rules/_format-pilot.mdc',
  '.cursor/rules/engineering-overview.mdc',
  '.cursor/rules/functional-style.mdc',
  '.cursor/rules/utils-and-modules.mdc',
  '.cursor/rules/hooks-policy.mdc',
  '.cursor/rules/memory-and-concurrency.mdc',
  '.cursor/rules/node-engines.mdc',
];

for (const rel of rules) {
  const p = join(repoRoot, rel);
  if (!existsSync(p)) {
    console.error('verify-phase1-rules: missing', rel);
    process.exit(1);
  }
}

console.log('verify-phase1-rules: ok');
