const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relativePath, stubs = {}) {
  const sourcePath = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const sandbox = {
    exports: {},
    require(name) {
      if (stubs[name]) return stubs[name];
      return require(name);
    },
    __dirname: path.dirname(sourcePath),
    process
  };
  vm.runInNewContext(compiled, sandbox, { filename: sourcePath });
  return sandbox.exports;
}

const schema = load('src/lib/kb/schema.ts');
const dbModule = load('src/lib/kb/db.ts', { './schema': schema });
const seedData = load('src/lib/kb/seedData.ts');
const init = load('src/lib/kb/initKnowledgeBase.ts', { './db': dbModule, './seedData': seedData });
const search = load('src/lib/kb/searchKnowledgeBase.ts');
const builder = load('src/lib/kb/buildKnowledgeAnswer.ts', {
  '@/lib/safety/legalRiskGuard': {
    appendLegalNotice: (text) =>
      text.includes('법률 자문이 아닙니다')
        ? text
        : `${text}\n\n아래 내용은 법률정보 탐색을 돕기 위한 참고자료이며, 개별 사건에 대한 법률 자문이 아닙니다.`
  },
  './searchKnowledgeBase': search
});

const db = dbModule.createInMemoryKnowledgeDb();
init.seedKnowledgeBase(db);
const bundle = builder.buildKnowledgeAnswer(
  db,
  {
    issueCard: 'startup',
    intakeMode: 'open',
    businessType: '',
    stage: '창업 전',
    stakeholder: '',
    documentStatus: '아직 없음',
    interestIssue: '',
    question: '상가 계약 전 검토 사항이 있다면?'
  },
  search.searchKnowledgeBase
);

assert(bundle.intake.issue_type.includes('상가 계약 전 검토'));
assert(bundle.route.law_candidates.includes('상가건물 임대차보호법'));
assert(bundle.evidence.evidence_items.some((item) => item.title.includes('상가건물 임대차보호법')));
assert(bundle.answer.summary.includes('상가 계약 전'));
assert(bundle.answer.checklist.some((item) => item.includes('권리금')));
assert(bundle.answer.answer_markdown.includes('공식 근거 후보'));
assert.equal(bundle.risk.risk_level, 'low');
assert(bundle.risk.final_answer_markdown.includes('법률 자문이 아닙니다'));
db.close();
