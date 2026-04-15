const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'src', 'lib', 'gemini', 'client.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;

let calls = 0;
const sandbox = {
  exports: {},
  process: { env: { GEMINI_API_KEY: 'test-key' } },
  fetch: async () => {
    calls += 1;
    if (calls === 1) {
      return { ok: false, status: 503, statusText: 'Service Unavailable' };
    }

    return {
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }]
      })
    };
  }
};

vm.runInNewContext(compiled, sandbox, { filename: sourcePath });

(async () => {
  const result = await sandbox.exports.callGemini('prompt', {
    responseSchema: { type: 'object' }
  });

  assert.equal(calls, 2, 'transient Gemini 503 should trigger one retry');
  assert.equal(result.ok, true);
})();
