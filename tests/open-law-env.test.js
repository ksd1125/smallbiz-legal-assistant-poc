const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'src', 'lib', 'law', 'openLawClient.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;

async function loadClient(env) {
  const sandbox = {
    exports: {},
    process: { env },
    URLSearchParams,
    fetch: async (url) => {
      sandbox.lastFetchUrl = url;
      return {
        ok: true,
        json: async () => ({ LawSearch: { law: [{ 법령명한글: '상가건물 임대차보호법', 소관부처명: '법무부' }] } })
      };
    }
  };

  vm.runInNewContext(compiled, sandbox, { filename: sourcePath });
  return sandbox;
}

(async () => {
  const sandbox = await loadClient({
    OPEN_LAW_OC: '',
    LAW_API_KEY: 'fallback-oc'
  });

  const results = await sandbox.exports.searchOpenLaw({
    source: 'open_law',
    target: 'law',
    query: '상가 임대차'
  });

  assert.equal(results[0].title, '상가건물 임대차보호법');
  assert(sandbox.lastFetchUrl.includes('OC=fallback-oc'), 'LAW_API_KEY should be used as OC fallback for direct Open Law search');
})();
