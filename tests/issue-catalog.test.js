const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const catalogPath = path.join(__dirname, '..', 'src', 'lib', 'issueCatalog.ts');
const source = fs.readFileSync(catalogPath, 'utf8');

assert(source.includes("export const issueCatalog"), 'issue catalog must export issueCatalog');
assert(source.includes('자주 묻는 이슈'), 'issue catalog should explain FAQ-style issue prompts');

const issueIds = [...source.matchAll(/id: '([^']+)'/g)].map((match) => match[1]);
assert.equal(new Set(issueIds).size, 8, 'issue catalog should include 8 unique issue cards');

for (const id of issueIds) {
  const start = source.indexOf(`id: '${id}'`);
  const next = source.indexOf('\n  {', start + 1);
  const block = source.slice(start, next === -1 ? source.length : next);
  assert(block.includes('frequentIssues'), `${id} must include frequentIssues`);
  assert(block.includes('relatedLawCandidates'), `${id} must include relatedLawCandidates`);
}
