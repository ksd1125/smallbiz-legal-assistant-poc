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
const maxOutputTokensByCall = [];
const sandbox = {
  exports: {},
  process: { env: { GEMINI_API_KEY: 'test-key' } },
  fetch: async (_url, init) => {
    calls += 1;
    const body = JSON.parse(init.body);
    maxOutputTokensByCall.push(body.generationConfig.maxOutputTokens);
    const text = calls === 1
      ? '{"business_type":"카페","stage":"운영 중","stakeholder":"임대인'
      : '{"business_type":"카페","stage":"운영 중","stakeholder":"임대인"}';

    return {
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text }] } }]
      })
    };
  }
};

vm.runInNewContext(compiled, sandbox, { filename: sourcePath });

(async () => {
  const result = await sandbox.exports.callGemini('prompt', {
    responseSchema: { type: 'object' }
  });

  assert.equal(calls, 2, 'malformed Gemini JSON should trigger one retry');
  assert(maxOutputTokensByCall[1] >= 8192, 'retry should use a larger maxOutputTokens budget to avoid truncated JSON');
  assert.equal(result.business_type, '카페');
})();
