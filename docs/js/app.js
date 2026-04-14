const issueCards = [
  { id: 'startup', title: '창업 준비', description: '인허가, 임대차, 사업 시작 전 확인', laws: ['식품위생법', '상가건물 임대차보호법', '부가가치세법'], frequentIssues: [{ label: '인허가', question: '창업 전에 우리 업종에서 먼저 확인해야 할 인허가가 무엇인가요?' }, { label: '상가 계약', question: '창업 전에 상가 계약서에서 어떤 항목을 확인해야 하나요?' }] },
  { id: 'lease', title: '상가 임대차', description: '보증금, 권리금, 갱신, 원상복구', laws: ['상가건물 임대차보호법', '민법'], frequentIssues: [{ label: '권리금', question: '상가 임대차에서 권리금 회수 기회를 보호받을 수 있는지 확인하려면 무엇이 필요한가요?' }, { label: '계약갱신', question: '상가 임대차 계약갱신을 요구할 수 있는지 확인하려면 어떤 정보를 봐야 하나요?' }, { label: '원상복구', question: '상가 계약 종료 시 원상복구 범위를 확인하려면 어떤 조항을 봐야 하나요?' }, { label: '보증금 반환', question: '임대인이 보증금을 돌려주지 않을 때 먼저 준비할 자료는 무엇인가요?' }] },
  { id: 'employment', title: '직원/아르바이트', description: '근로계약, 임금, 휴게, 해고', laws: ['근로기준법', '최저임금법', '근로자퇴직급여 보장법'], frequentIssues: [{ label: '근로계약서', question: '아르바이트 근로계약서를 작성할 때 꼭 확인해야 할 항목은 무엇인가요?' }, { label: '주휴수당', question: '주휴수당 지급 여부를 확인하려면 어떤 근무 정보를 봐야 하나요?' }, { label: '해고', question: '직원을 그만두게 할 때 절차상 먼저 확인할 사항은 무엇인가요?' }] },
  { id: 'contract', title: '계약서/약관', description: '위험 후보 조항과 확인 항목', laws: ['민법', '약관의 규제에 관한 법률', '전자상거래 등에서의 소비자보호에 관한 법률'], frequentIssues: [{ label: '위약금', question: '계약서의 위약금 조항이 과도한지 확인하려면 어떤 항목을 봐야 하나요?' }, { label: '자동연장', question: '계약 자동연장 조항에서 확인해야 할 위험 후보는 무엇인가요?' }, { label: '환불약관', question: '환불약관을 만들 때 소비자 분쟁을 줄이려면 무엇을 확인해야 하나요?' }] },
  { id: 'consumer', title: '환불/소비자 분쟁', description: '환불, 교환, 민원 대응', laws: ['소비자기본법', '전자상거래 등에서의 소비자보호에 관한 법률'], frequentIssues: [{ label: '환불', question: '고객 환불 요청에 대응하기 전에 어떤 기준과 자료를 확인해야 하나요?' }, { label: '교환', question: '제품 교환 요청이 들어왔을 때 사업자가 먼저 확인할 항목은 무엇인가요?' }, { label: '민원', question: '소비자 민원이 접수되었을 때 대응 기록은 어떻게 정리하면 좋나요?' }] },
  { id: 'debt', title: '미수금/내용증명', description: '대금 미지급과 절차 확인', laws: ['민법', '민사소송법', '소액사건심판법'], frequentIssues: [{ label: '내용증명', question: '거래처가 대금을 주지 않을 때 내용증명 전에 준비할 자료는 무엇인가요?' }, { label: '지급명령', question: '미수금 지급명령을 검토하기 전에 어떤 정보를 확인해야 하나요?' }] },
  { id: 'administrative', title: '행정처분/과태료', description: '영업정지, 과태료, 행정심판', laws: ['행정심판법', '행정절차법', '질서위반행위규제법'], frequentIssues: [{ label: '영업정지', question: '영업정지 처분서를 받았을 때 먼저 확인해야 할 기한과 절차는 무엇인가요?' }, { label: '과태료', question: '과태료 통지를 받았을 때 의견제출이나 이의제기 기한은 어떻게 확인하나요?' }] },
  { id: 'closure', title: '폐업/양도', description: '폐업신고, 양도, 계약 종료', laws: ['부가가치세법', '근로기준법', '상가건물 임대차보호법'], frequentIssues: [{ label: '폐업신고', question: '폐업할 때 세금과 계약 관련해서 먼저 확인해야 할 사항은 무엇인가요?' }, { label: '권리양도', question: '가게를 양도할 때 권리금과 임대차 계약에서 확인해야 할 항목은 무엇인가요?' }, { label: '직원 정리', question: '폐업 전 직원에게 안내하거나 정산할 항목은 무엇인가요?' }] }
];

const state = {
  selectedIssue: issueCards[0],
  intakeMode: 'guided',
  interestIssue: '',
  activeTab: 'summary',
  result: null
};

const issueGrid = document.querySelector('#issueGrid');
const frequentIssues = document.querySelector('#frequentIssues');
const guidedModeButton = document.querySelector('#guidedModeButton');
const openModeButton = document.querySelector('#openModeButton');
const businessType = document.querySelector('#businessType');
const stage = document.querySelector('#stage');
const stakeholder = document.querySelector('#stakeholder');
const documentStatus = document.querySelector('#documentStatus');
const question = document.querySelector('#question');
const analyzeButton = document.querySelector('#analyzeButton');
const geminiApiKey = document.querySelector('#geminiApiKey');
const openLawOc = document.querySelector('#openLawOc');
const provider = document.querySelector('#provider');
const copyEnvButton = document.querySelector('#copyEnvButton');
const clearKeysButton = document.querySelector('#clearKeysButton');
const envPreview = document.querySelector('#envPreview');
const apiMessage = document.querySelector('#apiMessage');
const resultContent = document.querySelector('#resultContent');

function renderIssueCards() {
  issueGrid.style.display = state.intakeMode === 'guided' ? 'grid' : 'none';
  issueGrid.innerHTML = issueCards.map((card) => `
    <button class="issueCard ${state.selectedIssue.id === card.id ? 'active' : ''}" data-issue="${card.id}" type="button">
      <strong>${card.title}</strong>
      <span>${card.description}</span>
    </button>
  `).join('');
  renderFrequentIssues();
}

function renderModeButtons() {
  guidedModeButton.classList.toggle('active', state.intakeMode === 'guided');
  openModeButton.classList.toggle('active', state.intakeMode === 'open');
}

function renderFrequentIssues() {
  if (state.intakeMode !== 'guided') {
    frequentIssues.innerHTML = '<p>법률명을 몰라도 한 문장으로 질문하세요. 관련 분야와 공식 근거 후보를 먼저 정리합니다.</p>';
    return;
  }
  frequentIssues.innerHTML = `
    <p><strong>자주 묻는 이슈</strong></p>
    <div class="chipRow">
      ${state.selectedIssue.frequentIssues.map((item) => `<button class="issueChip ${state.interestIssue === item.label ? 'active' : ''}" type="button" data-question="${escapeHtml(item.question)}" data-label="${escapeHtml(item.label)}">${escapeHtml(item.label)}</button>`).join('')}
    </div>
    <p>관련될 수 있는 법률 후보: ${state.selectedIssue.laws.map(escapeHtml).join(', ')}</p>
  `;
}

function buildEnvText() {
  const geminiKey = geminiApiKey.value.trim();
  const oc = openLawOc.value.trim();
  return [
    `GEMINI_API_KEY=${geminiKey}`,
    `OPEN_LAW_OC=${oc}`,
    `LEGAL_DATA_PROVIDER=${provider.value}`,
    'KOREAN_LAW_MCP_URL=http://localhost:8096/mcp',
    'LEXGUARD_MCP_URL=http://localhost:9099/mcp',
    `LAW_API_KEY=${oc}`,
    'NEXT_PUBLIC_APP_NAME=소상공인 법률정보 도우미'
  ].join('\n');
}

function updateEnvPreview() {
  const geminiKey = geminiApiKey.value.trim();
  const hasOc = openLawOc.value.trim().length > 0;
  envPreview.textContent = hasOc || geminiKey ? buildEnvText() : [
    `GEMINI_API_KEY=${geminiKey}`,
    'OPEN_LAW_OC=',
    `LEGAL_DATA_PROVIDER=${provider.value}`,
    'KOREAN_LAW_MCP_URL=http://localhost:8096/mcp',
    'LEXGUARD_MCP_URL=http://localhost:9099/mcp',
    'LAW_API_KEY=',
    'NEXT_PUBLIC_APP_NAME=소상공인 법률정보 도우미'
  ].join('\n');
}

function makeOpenLawUrl(query, target = 'law') {
  const params = new URLSearchParams({ target, type: 'HTML', query });
  const oc = openLawOc.value.trim();
  if (oc) params.set('OC', oc);
  return `https://www.law.go.kr/DRF/lawSearch.do?${params.toString()}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildResult() {
  const bt = businessType.value.trim() || '업종 미입력';
  const userQuestion = question.value.trim() || '질문 미입력';
  const stakeholderText = stakeholder.value.trim() || '관계자 미입력';
  const documentText = documentStatus.value;
  const baseTerms = [...state.selectedIssue.laws];
  const searchTerms = [...new Set([...baseTerms, bt, stakeholderText, userQuestion].filter(Boolean))];
  const query = searchTerms.join(' ');

  return {
    issueTitle: state.selectedIssue.title,
    businessType: bt,
    stage: stage.value,
    stakeholder: stakeholderText,
    documentStatus: documentText,
    question: userQuestion,
    laws: baseTerms,
    query,
    lawUrl: makeOpenLawUrl(query, 'law'),
    caseUrl: makeOpenLawUrl(query, 'prec'),
    interpretationUrl: makeOpenLawUrl(query, 'expc'),
    checklist: [
      '업종과 사업장 소재지에 따라 별도 인허가가 필요한지 확인',
      '상대방과 날짜가 있는 문서의 종류를 확인',
      '계약서, 고지서, 처분서처럼 날짜가 있는 문서의 기한 확인',
      '법령명과 조문 후보를 국가법령정보에서 다시 확인',
      '개별 사건 판단은 변호사 또는 공공 법률상담으로 확인'
    ],
    nextQuestions: [
      `${bt} 업종에서 가장 먼저 확인해야 할 인허가는 무엇인가요?`,
      `${state.selectedIssue.title} 상황에서 관련 법령 후보를 더 좁히려면 어떤 정보가 필요한가요?`,
      `${stakeholderText}와 관련해 상담 전에 준비할 자료는 무엇인가요?`
    ]
  };
}

function renderResult() {
  if (!state.result) {
    resultContent.innerHTML = '<p>상황을 입력하면 결과가 여기에 표시됩니다.</p>';
    return;
  }

  const r = state.result;
  const businessTypeText = escapeHtml(r.businessType);
  const stageText = escapeHtml(r.stage);
  const issueTitleText = escapeHtml(r.issueTitle);
  const stakeholderText = escapeHtml(r.stakeholder);
  const documentStatusText = escapeHtml(r.documentStatus);
  const questionText = escapeHtml(r.question);
  const lawsText = r.laws.map(escapeHtml).join(', ');
  const queryText = escapeHtml(r.query);
  const lawUrl = escapeHtml(r.lawUrl);
  const caseUrl = escapeHtml(r.caseUrl);
  const interpretationUrl = escapeHtml(r.interpretationUrl);
  const views = {
    summary: `
      <h2>요약</h2>
      <p><strong>${businessTypeText}</strong>의 <strong>${stageText}</strong> 단계에서 <strong>${issueTitleText}</strong> 이슈를 확인합니다.</p>
      <p>상대방/관계자: ${stakeholderText} · 문서 상태: ${documentStatusText}</p>
      <p>질문: ${questionText}</p>
      <p>우선 검색할 법령 후보: ${lawsText}</p>
      <p class="privacyNotice">아래 내용은 법률정보 탐색을 돕기 위한 참고자료이며, 개별 사건에 대한 법률 자문은 아닙니다.</p>
    `,
    sources: `
      <h2>공식 근거</h2>
      <ul>
        <li><a href="${lawUrl}" target="_blank" rel="noreferrer">국가법령정보 법령 검색</a></li>
        <li><a href="${caseUrl}" target="_blank" rel="noreferrer">국가법령정보 판례 검색</a></li>
        <li><a href="${interpretationUrl}" target="_blank" rel="noreferrer">국가법령정보 법령해석례 검색</a></li>
      </ul>
      <p>검색어: ${queryText}</p>
    `,
    checklist: `
      <h2>체크리스트</h2>
      <ul>${r.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    `,
    next: `
      <h2>다음 질문</h2>
      <ul>${r.nextQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    `,
    copy: `
      <h2>HWP/Excel 복사용</h2>
      <pre class="copyBox">[요약]
${businessTypeText} / ${stageText} / ${issueTitleText}
상대방/관계자: ${stakeholderText}
문서 상태: ${documentStatusText}

[질문]
${questionText}

[관련될 수 있는 법률 후보]
${lawsText}

[체크리스트]
${r.checklist.map((item) => `- ${escapeHtml(item)}`).join('\n')}

[상담 준비 질문]
${r.nextQuestions.map((item) => `- ${escapeHtml(item)}`).join('\n')}

[주의]
법률정보 탐색을 돕기 위한 참고자료이며, 개별 사건에 대한 법률 자문은 아닙니다.</pre>
    `
  };

  resultContent.innerHTML = views[state.activeTab];
}

issueGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-issue]');
  if (!button) return;
  state.selectedIssue = issueCards.find((card) => card.id === button.dataset.issue) || issueCards[0];
  state.interestIssue = '';
  renderIssueCards();
});

frequentIssues.addEventListener('click', (event) => {
  const button = event.target.closest('[data-question]');
  if (!button) return;
  state.interestIssue = button.dataset.label;
  question.value = button.dataset.question;
  renderFrequentIssues();
});

guidedModeButton.addEventListener('click', () => {
  state.intakeMode = 'guided';
  renderModeButtons();
  renderIssueCards();
});

openModeButton.addEventListener('click', () => {
  state.intakeMode = 'open';
  state.interestIssue = '';
  renderModeButtons();
  renderIssueCards();
});

document.querySelectorAll('.tabButton').forEach((button) => {
  button.addEventListener('click', () => {
    state.activeTab = button.dataset.tab;
    document.querySelectorAll('.tabButton').forEach((item) => item.classList.toggle('active', item === button));
    renderResult();
  });
});

analyzeButton.addEventListener('click', () => {
  state.result = buildResult();
  state.activeTab = 'summary';
  document.querySelectorAll('.tabButton').forEach((item) => item.classList.toggle('active', item.dataset.tab === 'summary'));
  renderResult();
});

copyEnvButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(buildEnvText());
  apiMessage.textContent = '.env.local에 붙여넣을 내용을 복사했습니다.';
});

clearKeysButton.addEventListener('click', () => {
  geminiApiKey.value = '';
  openLawOc.value = '';
  apiMessage.textContent = '입력값을 지웠습니다.';
  updateEnvPreview();
});

geminiApiKey.addEventListener('input', updateEnvPreview);
openLawOc.addEventListener('input', updateEnvPreview);
provider.addEventListener('change', updateEnvPreview);

renderIssueCards();
renderModeButtons();
updateEnvPreview();
