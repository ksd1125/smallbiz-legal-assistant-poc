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

const db = dbModule.createInMemoryKnowledgeDb();
init.seedKnowledgeBase(db);
init.seedKnowledgeBase(db);

assert.equal(db.prepare('SELECT COUNT(*) AS count FROM laws').get().count, 10);
assert.equal(db.prepare('SELECT COUNT(*) AS count FROM articles').get().count, 6);
assert(db.prepare("SELECT id FROM laws WHERE law_name = '상가건물 임대차보호법'").get());
assert(db.prepare("SELECT id FROM topics WHERE topic_name = '상가 계약 전 검토'").get());
assert(db.prepare("SELECT id FROM answer_templates WHERE answer_title = '상가 계약 전 확인사항'").get());
assert(db.prepare("SELECT id FROM articles WHERE article_title LIKE '%계약 전 확인%'").get());
db.close();
