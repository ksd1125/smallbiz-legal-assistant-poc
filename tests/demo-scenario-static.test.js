const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const demoPath = path.join(__dirname, '..', 'docs', 'demo-scenario.html');

assert(fs.existsSync(demoPath), 'demo scenario HTML should exist');

const html = fs.readFileSync(demoPath, 'utf8');

assert(html.includes('id="general-screen"'), 'demo should include the general question screen');
assert(html.includes('id="advanced-screen"'), 'demo should include the advanced scenario screen');
assert(html.includes('id="inside-screen"'), 'demo should include the internal architecture screen');
assert(html.includes('Codex형 일반 질의'), 'general screen should describe the Codex-style question UI');
assert(html.includes('업종·상황 심화 점검'), 'advanced screen should describe the industry and situation flow');
assert(html.includes('class="qaLayout"'), 'general screen should use a clear question and answer layout');
assert(html.includes('class="questionPanel"'), 'general screen should visually separate the question area');
assert(html.includes('class="answerPanel"'), 'general screen should visually separate the answer area');
assert(html.includes('id="generalAnswerSummary"'), 'general answer should have a clear summary target');
assert(html.includes('id="generalDomains"'), 'general answer should show related domains in a distinct area');
assert(html.includes('id="generalNextActions"'), 'general answer should show next actions in a distinct area');
assert(html.includes('class="advancedWorkspace"'), 'advanced screen should use a separated input and answer workspace');
assert(html.includes('class="advancedInputPanel"'), 'advanced screen should visually separate structured inputs');
assert(html.includes('class="advancedAnswerPanel"'), 'advanced screen should visually separate the advanced answer');
assert(html.includes('id="advancedSummary"'), 'advanced answer should have a clear summary target');
assert(html.includes('입력 조건'), 'advanced screen should label the structured input area');
assert(html.includes('심화 답변'), 'advanced screen should label the answer area');
assert(html.includes('필수 입력'), 'advanced screen should distinguish required inputs');
assert(html.includes('선택 입력'), 'advanced screen should keep non-required inputs optional');
assert(html.includes('id="optionalDetailToggle"'), 'advanced screen should include a toggle for optional details');
assert(html.includes('id="optionalDetails"'), 'advanced screen should include a collapsible optional detail area');
assert(html.includes('더 정확히 답하기 위한 질문'), 'advanced answer should ask follow-up questions instead of requiring all inputs upfront');
assert(html.includes('id="advancedAssumptions"'), 'advanced answer should show inferred assumptions');
assert(html.includes('id="followupQuestions"'), 'advanced answer should render follow-up questions');
assert(html.includes("optionalDetails.hidden = !isOpen"), 'optional details should be collapsible in the demo script');
assert(html.includes('데이터 수급'), 'internal view should show data supply');
assert(html.includes('파싱'), 'internal view should show parsing');
assert(html.includes('다중 분야 라우터'), 'internal view should show router behavior');
assert(html.includes('에이전트 분배'), 'internal view should show agent distribution');
assert(html.includes('카페 창업 전'), 'demo should include a cafe startup scenario');
assert(html.includes('소규모 제조업 창업'), 'demo should include a manufacturing scenario');
assert(html.includes('법률 자문'), 'demo should include service boundary wording');
assert(html.includes('id="service-info-panel"'), 'demo should include a service information panel');
assert(html.includes('id="serviceInfoButton"'), 'demo should include a button that opens the service information panel');
assert(html.includes('서비스 범위'), 'service information panel should explain service scope');
assert(html.includes('화면 구성'), 'service information panel should explain screen composition');
assert(html.includes('제공하는 것'), 'service information panel should explain what the service provides');
assert(html.includes('제공하지 않는 것'), 'service information panel should explain what the service does not provide');
assert(html.includes('공식자료 기반'), 'service information panel should explain official-source grounding');
assert(html.includes('데이터 수급 현실성'), 'service information panel should explain realistic data sourcing');
assert(html.includes('자동 수급 가능'), 'service information panel should separate sources that can be collected automatically');
assert(html.includes('반자동 수급·검수'), 'service information panel should identify sources that need review');
assert(html.includes('답변 제한'), 'service information panel should identify data that should not be overclaimed');
assert(html.includes('국가법령정보 Open API'), 'demo should identify Open Law API as a realistic structured source');
assert(html.includes('지방행정 인허가 데이터'), 'demo should identify local license data as a realistic source');
assert(html.includes('공공데이터포털 전환 확인'), 'demo should flag the local license data portal transition');
assert(html.includes('식품안전나라'), 'demo should identify food safety data as a realistic source');
assert(html.includes('하이브리드 검색'), 'demo should reflect hybrid search as the retrieval approach');
assert(html.includes('메타데이터 필터'), 'demo should reflect metadata filtering');
assert(html.includes('질의 재작성'), 'demo should reflect query rewriting');
assert(html.includes('출처 추적'), 'demo should reflect source provenance');
assert(html.includes('평가 세트'), 'demo should reflect evaluation sets for quality control');
assert(html.includes('사람 검수'), 'demo should reflect human review for legal templates and source use');
assert(
  html.includes("button.classList.contains('scenarioButton')") &&
    html.includes("setScreen('general-screen')"),
  'sidebar scenario buttons should switch to a visible answer screen when clicked'
);
assert(!html.includes('onerror='), 'demo should not include inline error handlers');
