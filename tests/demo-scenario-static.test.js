const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const demoPath = path.join(__dirname, '..', 'docs', 'demo-scenario.html');

assert(fs.existsSync(demoPath), 'demo scenario HTML should exist');

const html = fs.readFileSync(demoPath, 'utf8');

assert(html.includes('id="general-screen"'), 'demo should include the general question screen');
assert(html.includes('id="advanced-screen"'), 'demo should include the advanced scenario screen');
assert(html.includes('id="inside-screen"'), 'demo should include the internal architecture screen');
assert(html.includes('Codex형 일반 질의'), 'general screen should describe the Codex-style question UI');
assert(html.includes('업종·상황 심화 점검'), 'advanced screen should describe the industry and situation flow');
assert(html.includes('데이터 수급'), 'internal view should show data supply');
assert(html.includes('파싱'), 'internal view should show parsing');
assert(html.includes('다중 분야 라우터'), 'internal view should show router behavior');
assert(html.includes('에이전트 분배'), 'internal view should show agent distribution');
assert(html.includes('카페 창업 전'), 'demo should include a cafe startup scenario');
assert(html.includes('소규모 제조업 창업'), 'demo should include a manufacturing scenario');
assert(html.includes('법률 자문'), 'demo should include service boundary wording');
assert(!html.includes('onerror='), 'demo should not include inline error handlers');
