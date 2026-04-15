const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const mockupPath = path.join(__dirname, '..', 'docs', 'integrated-ai-hub.html');

assert(fs.existsSync(mockupPath), 'integrated AI mockup HTML should exist');

const html = fs.readFileSync(mockupPath, 'utf8');

assert(html.includes('통합 AI 허브'), 'mockup should present an integrated AI hub');
assert(html.includes('단일 입력창'), 'mockup should use a single prompt entry point');
assert(html.includes('오케스트레이터'), 'mockup should explain the orchestrator');
assert(html.includes('정책 AI'), 'mockup should include policy AI');
assert(html.includes('상권 AI'), 'mockup should include market AI');
assert(html.includes('법률 AI'), 'mockup should include legal AI');
assert(html.includes('통계 AI'), 'mockup should include statistics AI');
assert(html.includes('통합 답변'), 'mockup should show a combined response area');
assert(html.includes('세부 보기'), 'mockup should support domain detail views');
assert(html.includes('정책 세부'), 'mockup should include policy detail content');
assert(html.includes('상권 세부'), 'mockup should include market detail content');
assert(html.includes('법률 세부'), 'mockup should include legal detail content');
assert(html.includes('통계 세부'), 'mockup should include statistics detail content');
assert(html.includes('소상공인24'), 'policy AI should identify its source');
assert(html.includes('소상공인 365'), 'market AI should identify its source');
assert(html.includes('국가법령정보센터'), 'legal AI should identify its source');
assert(html.includes('KOSIS'), 'statistics AI should identify its source');
assert(html.includes('Text-to-SQL'), 'mockup should reflect analytical agent requirements');
assert(html.includes('RAG'), 'mockup should reflect RAG requirements');
assert(html.includes('Fallback'), 'mockup should explain fallback routing');
assert(html.includes('출처'), 'mockup should show source attribution');
assert(html.includes('품질 기준'), 'mockup should show quality criteria');
assert(html.includes('동적 UI'), 'mockup should show dynamic UI rendering');
assert(html.includes('data-domain="policy"'), 'policy detail button should be wired');
assert(html.includes('data-domain="market"'), 'market detail button should be wired');
assert(html.includes('data-domain="legal"'), 'legal detail button should be wired');
assert(html.includes('data-domain="stats"'), 'statistics detail button should be wired');
assert(html.includes('id="detailPanel"'), 'mockup should include a domain detail panel');
assert(html.includes('id="routeSteps"'), 'mockup should include routing steps');
assert(html.includes('id="sourceList"'), 'mockup should include source list rendering');
assert(!html.includes('onerror='), 'mockup should not include inline error handlers');
