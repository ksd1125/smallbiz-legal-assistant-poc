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
assert(schema.KNOWLEDGE_SCHEMA.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS laws')));
assert(schema.KNOWLEDGE_SCHEMA.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS articles')));
assert(schema.KNOWLEDGE_SCHEMA.some((sql) => sql.includes('CREATE VIRTUAL TABLE IF NOT EXISTS article_fts')));

const dbModule = load('src/lib/kb/db.ts', { './schema': schema });
const db = dbModule.createInMemoryKnowledgeDb();
const names = db.prepare("SELECT name FROM sqlite_master WHERE type IN ('table','virtual table')").all().map((row) => row.name);
assert(names.includes('laws'));
assert(names.includes('articles'));
assert(names.includes('topics'));
assert(names.includes('answer_templates'));
assert(names.includes('article_fts'));
db.close();
