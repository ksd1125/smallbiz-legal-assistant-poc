const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'src', 'lib', 'localFallbacks.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;

const sandbox = {
  exports: {},
  require(moduleName) {
    if (moduleName === './safety/legalRiskGuard') {
      const legalNotice = '아래 내용은 법률정보 탐색을 돕기 위한 참고자료이며, 개별 사건에 대한 법률 자문이 아닙니다.';
      return {
        appendLegalNotice: (text) => text.includes(legalNotice) ? text : `${text}\n\n${legalNotice}`,
        findLocalRiskPhrases: () => []
      };
    }
    throw new Error(`Unexpected require: ${moduleName}`);
  }
};
vm.runInNewContext(compiled, sandbox, { filename: sourcePath });

assert.equal(
  sandbox.exports.isGeminiQuotaError(new Error('Gemini API error: 429 Too Many Requests')),
  true,
  '429 should be treated as a Gemini quota error'
);

const intake = sandbox.exports.createFallbackIntake({
  issueCard: 'lease',
  intakeMode: 'guided',
  businessType: '카페',
  stage: '운영 중',
  stakeholder: '임대인',
  documentStatus: '계약서 있음',
  interestIssue: '계약갱신',
  question: ''
});

assert.equal(intake.business_type, '카페');
assert(intake.issue_type.includes('상가 임대차'));

const route = sandbox.exports.createFallbackRoute(intake);
assert(route.legal_domains.includes('상가 임대차'));
assert(route.search_queries.some((query) => query.target === 'law'));

const evidence = sandbox.exports.createFallbackEvidence(route, [
  {
    source: '국가법령정보',
    type: 'law',
    title: '상가건물 임대차보호법',
    summary: '법무부',
    url: 'https://www.law.go.kr'
  }
]);
assert.equal(evidence.evidence_items[0].title, '상가건물 임대차보호법');

const singleEvidence = sandbox.exports.createFallbackEvidence(route, {
  source: '국가법령정보',
  type: 'law',
  title: '민법',
  summary: '법무부'
});
assert.equal(singleEvidence.evidence_items[0].title, '민법');

const answer = sandbox.exports.createFallbackAnswer(intake, route, evidence);
assert(answer.summary.includes('Gemini API 사용량 제한'));
assert(answer.checklist.length >= 4);

const risk = sandbox.exports.createFallbackRisk(answer);
assert.equal(risk.risk_level, 'low');
assert(risk.final_answer_markdown.includes('법률 자문이 아닙니다'));
