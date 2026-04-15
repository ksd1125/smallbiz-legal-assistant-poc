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

const db = dbModule.createInMemoryKnowledgeDb();
init.seedKnowledgeBase(db);

const lease = search.searchKnowledgeBase(db, '상가 계약 전 검토 사항이 있다면?');
assert.equal(lease.topic.topicName, '상가 계약 전 검토');
assert(lease.lawCandidates.includes('상가건물 임대차보호법'));
assert(lease.evidenceItems.some((item) => item.title.includes('상가 계약 전 확인')));

const employment = search.searchKnowledgeBase(db, '아르바이트 근로계약서 작성 시 확인할 것은?');
assert.equal(employment.topic.topicName, '아르바이트 근로계약');
assert(employment.lawCandidates.includes('근로기준법'));

const refund = search.searchKnowledgeBase(db, '고객 환불 요청이 들어오면 어떤 기준을 확인해야 하나?');
assert.equal(refund.topic.topicName, '온라인 판매 환불');
assert(refund.lawCandidates.includes('전자상거래 등에서의 소비자보호에 관한 법률'));

db.close();
