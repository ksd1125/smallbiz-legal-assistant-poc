import type {
  AnswerResult,
  EvidenceResult,
  IntakeInput,
  IntakeResult,
  LawSearchResult,
  LegalRouteResult,
  RiskCheckResult
} from '@/types/legalAssistant';
import { appendLegalNotice, findLocalRiskPhrases } from './safety/legalRiskGuard';

const issueProfiles: Record<string, { title: string; laws: string[] }> = {
  startup: { title: '창업 준비', laws: ['식품위생법', '상가건물 임대차보호법', '부가가치세법'] },
  lease: { title: '상가 임대차', laws: ['상가건물 임대차보호법', '민법'] },
  employment: { title: '직원/아르바이트', laws: ['근로기준법', '최저임금법'] },
  contract: { title: '계약서/약관', laws: ['민법', '약관의 규제에 관한 법률'] },
  consumer: { title: '환불/소비자 분쟁', laws: ['소비자기본법', '전자상거래 등에서의 소비자보호에 관한 법률'] },
  debt: { title: '미수금/내용증명', laws: ['민법', '민사소송법', '소액사건심판법'] },
  administrative: { title: '행정처분/과태료', laws: ['행정심판법', '행정절차법'] },
  closure: { title: '폐업/양도', laws: ['부가가치세법', '근로기준법', '상가건물 임대차보호법'] }
};

export function isGeminiQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Gemini API error: 429\b|Too Many Requests/i.test(message);
}

export function createFallbackIntake(input: IntakeInput): IntakeResult {
  const profile = issueProfiles[input.issueCard] ?? issueProfiles.startup;
  return {
    business_type: input.businessType.trim() || '업종 미입력',
    stage: input.stage,
    stakeholder: input.stakeholder.trim() || '관계자 미입력',
    document_status: input.documentStatus,
    interest_issue: input.interestIssue || profile.title,
    intake_mode: input.intakeMode,
    issue_type: [profile.title],
    urgency: input.stage.includes('처분') || input.stage.includes('분쟁') ? '높음' : '보통',
    missing_info: [
      '사업장 소재지와 관할 기관',
      '계약서, 처분서, 고지서 등 날짜가 있는 문서의 수령일',
      '상대방과 주고받은 문자, 이메일, 통지 내역'
    ],
    next_questions: [
      '날짜가 있는 문서의 작성일 또는 수령일은 언제인가요?',
      '상대방과 이미 주고받은 통지나 답변이 있나요?',
      '공식 법령 검색에서 확인하고 싶은 핵심 단어는 무엇인가요?'
    ]
  };
}

export function createFallbackRoute(intake: IntakeResult): LegalRouteResult {
  const domain = intake.issue_type[0] || intake.interest_issue || '소상공인 법률정보';
  const profile = Object.values(issueProfiles).find((item) => item.title === domain);
  const lawCandidates = profile?.laws ?? ['민법', '상가건물 임대차보호법', '근로기준법'];
  const baseQuery = [
    ...lawCandidates,
    intake.business_type,
    intake.stakeholder,
    intake.interest_issue
  ].filter(Boolean).join(' ');

  return {
    legal_domains: [domain],
    law_candidates: lawCandidates,
    search_queries: [
      { source: 'open_law', target: 'law', query: baseQuery },
      { source: 'open_law', target: 'prec', query: baseQuery },
      { source: 'open_law', target: 'expc', query: baseQuery }
    ],
    reason: 'Gemini API 사용량 제한으로 기본 규칙 기반 검색어를 만들었습니다.'
  };
}

export function createFallbackEvidence(route: LegalRouteResult, searchResults: LawSearchResult[] | LawSearchResult | unknown): EvidenceResult {
  const items = Array.isArray(searchResults)
    ? searchResults
    : searchResults && typeof searchResults === 'object'
      ? [searchResults as LawSearchResult]
      : [];
  const evidenceItems = items.slice(0, 5).map((item) => ({
    source: item.source,
    type: item.type,
    title: item.title,
    summary: item.summary,
    url: item.url
  }));

  return {
    evidence_items: evidenceItems,
    evidence_gap: [
      'Gemini API 사용량 제한으로 근거 요약은 기본 형식으로 정리했습니다.',
      '공식 출처 링크를 열어 최신 조문과 적용 범위를 다시 확인해야 합니다.'
    ]
  };
}

export function createFallbackAnswer(
  intake: IntakeResult,
  route: LegalRouteResult,
  evidence: EvidenceResult
): AnswerResult {
  const laws = route.law_candidates.join(', ');
  const summary = `Gemini API 사용량 제한으로 기본 규칙 기반 결과를 표시합니다. ${intake.business_type}의 ${intake.stage} 단계에서 ${route.legal_domains.join(', ')} 관련 법률정보 후보를 확인하세요.`;
  const checklist = [
    `관련될 수 있는 법령 후보(${laws})를 국가법령정보에서 확인`,
    '계약서, 고지서, 처분서 등 날짜가 있는 문서의 작성일과 수령일 확인',
    '상대방과 주고받은 문자, 이메일, 내용증명 등 증빙자료 정리',
    '기한이 있는 처분, 과태료, 계약갱신, 이의제기 사항인지 확인',
    '개별 사건 판단은 변호사 또는 공공 법률상담에서 확인'
  ];
  const cautions = [
    '이 결과는 법률정보 탐색 보조용이며 법률 자문이 아닙니다.',
    '공식 출처와 실제 문서 내용을 반드시 다시 확인해야 합니다.'
  ];
  const nextQuestions = [
    ...intake.next_questions,
    '공식 출처에서 확인한 조문명과 조문번호는 무엇인가요?',
    '상담 전에 꼭 설명해야 할 사실관계는 무엇인가요?'
  ];

  return {
    summary,
    related_domains: route.legal_domains,
    checklist,
    cautions,
    next_questions: nextQuestions,
    answer_markdown: appendLegalNotice([
      summary,
      '',
      '[공식 근거 후보]',
      ...evidence.evidence_items.map((item) => `- ${item.title}: ${item.summary}`),
      '',
      '[체크리스트]',
      ...checklist.map((item) => `- ${item}`)
    ].join('\n'))
  };
}

export function createFallbackRisk(answer: AnswerResult): RiskCheckResult {
  const safeAnswer = appendLegalNotice(answer.answer_markdown || answer.summary);
  return {
    risk_level: 'low',
    blocked_phrases: findLocalRiskPhrases(safeAnswer),
    safe_rewrite_required: false,
    notice: 'Gemini API 사용량 제한으로 로컬 안전 고지만 적용했습니다.',
    final_answer_markdown: safeAnswer
  };
}
