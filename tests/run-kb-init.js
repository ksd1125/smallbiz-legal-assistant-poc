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
    process,
    console
  };
  vm.runInNewContext(compiled, sandbox, { filename: sourcePath });
  return sandbox.exports;
}

const schema = load('src/lib/kb/schema.ts');
const dbModule = load('src/lib/kb/db.ts', { './schema': schema });
const seedData = load('src/lib/kb/seedData.ts');
const init = load('src/lib/kb/initKnowledgeBase.ts', { './db': dbModule, './seedData': seedData });
const result = init.initializeKnowledgeBase();
console.log(`Knowledge base ready: laws=${result.lawCount}, articles=${result.articleCount}, topics=${result.topicCount}`);
