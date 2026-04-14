const issueCards = [
  { id: 'startup', title: '창업 준비', description: '인허가, 임대차, 사업 시작 전 확인', laws: ['식품위생법', '상가건물 임대차보호법', '부가가치세법'] },
  { id: 'lease', title: '상가 임대차', description: '보증금, 권리금, 갱신, 원상복구', laws: ['상가건물 임대차보호법', '민법'] },
  { id: 'employment', title: '직원/아르바이트', description: '근로계약, 임금, 휴게, 해고', laws: ['근로기준법', '최저임금법', '근로자퇴직급여 보장법'] },
  { id: 'contract', title: '계약서/약관', description: '위험 후보 조항과 확인 항목', laws: ['민법', '약관의 규제에 관한 법률', '전자상거래 등에서의 소비자보호에 관한 법률'] },
  { id: 'consumer', title: '환불/소비자 분쟁', description: '환불, 교환, 민원 대응', laws: ['소비자기본법', '전자상거래 등에서의 소비자보호에 관한 법률'] },
  { id: 'debt', title: '미수금/내용증명', description: '대금 미지급과 절차 확인', laws: ['민법', '민사소송법', '소액사건심판법'] },
  { id: 'administrative', title: '행정처분/과태료', description: '영업정지, 과태료, 행정심판', laws: ['행정심판법', '행정절차법', '질서위반행위규제법'] },
  { id: 'closure', title: '폐업/양도', description: '폐업신고, 양도, 계약 종료', laws: ['부가가치세법', '근로기준법', '상가건물 임대차보호법'] }
];

const state = {
  selectedIssue: issueCards[0],
  activeTab: 'summary',
  result: null
};

const issueGrid = document.querySelector('#issueGrid');
const businessType = document.querySelector('#businessType');
const stage = document.querySelector('#stage');
const question = document.querySelector('#question');
const analyzeButton = document.querySelector('#analyzeButton');
const openLawOc = document.querySelector('#openLawOc');
const provider = document.querySelector('#provider');
const copyEnvButton = document.querySelector('#copyEnvButton');
const clearKeysButton = document.querySelector('#clearKeysButton');
const envPreview = document.querySelector('#envPreview');
const apiMessage = document.querySelector('#apiMessage');
const resultContent = document.querySelector('#resultContent');

function renderIssueCards() {
  issueGrid.innerHTML = issueCards.map((card) => `
    <button class="issueCard ${state.selectedIssue.id === card.id ? 'active' : ''}" data-issue="${card.id}" type="button">
      <strong>${card.title}</strong>
      <span>${card.description}</span>
    </button>
  `).join('');
}

function buildEnvText() {
  const oc = openLawOc.value.trim();
  return [
    'GEMINI_API_KEY=',
    `OPEN_LAW_OC=${oc}`,
    `LEGAL_DATA_PROVIDER=${provider.value}`,
    'KOREAN_LAW_MCP_URL=http://localhost:8096/mcp',
    'LEXGUARD_MCP_URL=http://localhost:9099/mcp',
    `LAW_API_KEY=${oc}`,
    'NEXT_PUBLIC_APP_NAME=소상공인 법률정보 도우미'
  ].join('\n');
}

function updateEnvPreview() {
  const hasOc = openLawOc.value.trim().length > 0;
  envPreview.textContent = hasOc ? buildEnvText() : [
    'GEMINI_API_KEY=',
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
  const baseTerms = [...state.selectedIssue.laws];
  const searchTerms = [...new Set([...baseTerms, bt, userQuestion].filter(Boolean))];
  const query = searchTerms.join(' ');

  return {
    issueTitle: state.selectedIssue.title,
    businessType: bt,
    stage: stage.value,
    question: userQuestion,
    laws: baseTerms,
    query,
    lawUrl: makeOpenLawUrl(query, 'law'),
    caseUrl: makeOpenLawUrl(query, 'prec'),
    interpretationUrl: makeOpenLawUrl(query, 'expc'),
    checklist: [
      '업종과 사업장 소재지에 따라 별도 인허가가 필요한지 확인',
      '계약서, 고지서, 처분서처럼 날짜가 있는 문서의 기한 확인',
      '법령명과 조문 후보를 국가법령정보에서 다시 확인',
      '개별 사건 판단은 변호사 또는 공공 법률상담으로 확인'
    ],
    nextQuestions: [
      `${bt} 업종에서 가장 먼저 확인해야 할 인허가는 무엇인가요?`,
      `${state.selectedIssue.title} 상황에서 관련 법령 후보를 더 좁히려면 어떤 정보가 필요한가요?`,
      '계약서 원문을 올리지 않고 조항 요약만으로 확인할 수 있는 항목은 무엇인가요?'
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
      <p>질문: ${questionText}</p>
      <p>우선 검색할 법령 후보: ${lawsText}</p>
      <p class="privacyNotice">아래 내용은 법률정보 탐색을 돕기 위한 참고자료이며, 개별 사건에 대한 법률 자문은 아닙니다.</p>
    `,
    sources: `
      <h2>검색 링크</h2>
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
    `
  };

  resultContent.innerHTML = views[state.activeTab];
}

issueGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-issue]');
  if (!button) return;
  state.selectedIssue = issueCards.find((card) => card.id === button.dataset.issue) || issueCards[0];
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
  openLawOc.value = '';
  apiMessage.textContent = '입력값을 지웠습니다.';
  updateEnvPreview();
});

openLawOc.addEventListener('input', updateEnvPreview);
provider.addEventListener('change', updateEnvPreview);

renderIssueCards();
updateEnvPreview();
