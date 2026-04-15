const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const pageSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'page.tsx'), 'utf8');
const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'knowledge-answer', 'route.ts');

assert(fs.existsSync(routePath), 'knowledge answer API route should exist');
assert(pageSource.includes("'/api/knowledge-answer'"), 'page should call the SQLite knowledge answer API');
assert(!pageSource.includes("'/api/intake'"), 'page should not start the old multi-step Gemini intake flow');
assert(!pageSource.includes("'/api/generate-answer'"), 'page should not call the old Gemini answer route by default');
