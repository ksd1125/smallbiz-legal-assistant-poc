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
assert(answer.summary.includes('상가 계약 전'));
assert(answer.checklist.length >= 4);

const risk = sandbox.exports.createFallbackRisk(answer);
assert.equal(risk.risk_level, 'low');
assert(risk.final_answer_markdown.includes('법률 자문이 아닙니다'));

const openLeaseIntake = sandbox.exports.createFallbackIntake({
  issueCard: 'startup',
  intakeMode: 'open',
  businessType: '',
  stage: '창업 전',
  stakeholder: '',
  documentStatus: '아직 없음',
  interestIssue: '',
  question: '상가 계약 전 검토 사항이 있다면?'
});
assert(openLeaseIntake.issue_type.includes('상가 임대차'), 'fallback should infer lease issue from open question');
assert.equal(openLeaseIntake.stakeholder, '임대인');

const openLeaseRoute = sandbox.exports.createFallbackRoute(openLeaseIntake);
assert(openLeaseRoute.law_candidates.includes('상가건물 임대차보호법'));
assert.equal(openLeaseRoute.search_queries[0].query, '상가건물 임대차보호법');
assert(!openLeaseRoute.search_queries[0].query.includes('업종 미입력'));

const openLeaseAnswer = sandbox.exports.createFallbackAnswer(
  openLeaseIntake,
  openLeaseRoute,
  sandbox.exports.createFallbackEvidence(openLeaseRoute, [])
);
assert(openLeaseAnswer.summary.includes('상가 계약 전'));
assert(openLeaseAnswer.checklist.some((item) => item.includes('권리금')));
assert(openLeaseAnswer.checklist.some((item) => item.includes('원상복구')));

const looseLeaseAnswer = sandbox.exports.createFallbackAnswer(
  {
    ...openLeaseIntake,
    issue_type: ['상가임대차']
  },
  {
    legal_domains: ['계약 검토'],
    law_candidates: ['민법', '상가건물 임대차보호법', '근로기준법'],
    search_queries: [],
    reason: 'fallback'
  },
  sandbox.exports.createFallbackEvidence(openLeaseRoute, [])
);
assert(looseLeaseAnswer.summary.includes('상가 계약 전'), 'lease answer should be selected from law candidates or compact issue text');

const noisyEvidence = sandbox.exports.createFallbackEvidence(openLeaseRoute, [
  {
    source: '국가법령정보',
    type: 'law',
    title: '상가건물 임대차보호법 민법 업종 미입력 임대인 상가 임대차',
    summary: '검색 결과가 없거나 응답 구조가 예상과 다릅니다.'
  },
  {
    source: '국가법령정보',
    type: 'law',
    title: '상가건물 임대차보호법',
    summary: '법무부'
  }
]);
assert.equal(noisyEvidence.evidence_items.length, 1, 'fallback evidence should hide no-result placeholder rows when better evidence exists');
