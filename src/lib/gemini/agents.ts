import type {
  AnswerResult,
  EvidenceResult,
  IntakeInput,
  IntakeResult,
  LawSearchResult,
  LegalRouteResult,
  RiskCheckResult
} from '@/types/legalAssistant';
import { callGemini } from './client';
import { answerSchema, evidenceSchema, intakeSchema, legalRouteSchema, riskCheckSchema } from './schemas';

const legalNotice = '이 서비스는 법률정보 탐색을 돕기 위한 참고 도구이며 개별 사건에 대한 법률 자문이 아닙니다.';

export async function runIntakeAgent(input: IntakeInput): Promise<IntakeResult> {
  return callGemini<IntakeResult>(
    `소상공인 법률정보 도우미의 Intake Agent입니다.

사용자 입력을 구조화하세요. 입력 방식은 intakeMode로 구분합니다.
- guided: 상황 카드와 자주 묻는 이슈를 사용자가 고른 경우
- open: 사용자가 법률명을 모르고 자유 질문으로 시작한 경우

stakeholder, documentStatus, interestIssue를 참고하되 법률 적용을 단정하지 마세요.
출력에는 stakeholder, document_status, interest_issue, intake_mode를 유지하세요.
빠진 정보는 최대 3개만 질문하세요.

입력:
${JSON.stringify(input, null, 2)}

법률 자문으로 단정하지 말고 정보 탐색에 필요한 항목만 정리하세요.`,
    { responseSchema: intakeSchema, maxOutputTokens: 1024 }
  );
}

export async function runLegalRouterAgent(intake: IntakeResult): Promise<LegalRouteResult> {
  return callGemini<LegalRouteResult>(
    `소상공인 법률정보 도우미의 Legal Router Agent입니다.

아래 상황을 국가법령정보 Open API 및 korean-law-mcp 검색에 적합한 법률 분야와 검색어로 바꾸세요.
target은 law, prec, expc, decc 중 하나를 사용하세요.
현재 POC는 LEGAL_DATA_PROVIDER 값에 따라 Open API 직접 호출 또는 SeoNaRu/korean-law-mcp 도구(search_law_tool, search_precedent_tool, search_administrative_rule_tool) 경유를 사용합니다.

상황:
${JSON.stringify(intake, null, 2)}`,
    { responseSchema: legalRouteSchema, maxOutputTokens: 1536 }
  );
}

export async function runEvidenceAgent(
  route: LegalRouteResult,
  searchResults: LawSearchResult[]
): Promise<EvidenceResult> {
  return callGemini<EvidenceResult>(
    `소상공인 법률정보 도우미의 Evidence Agent입니다.

검색 결과를 공식 출처 근거 후보로 정리하세요. 출처가 부족한 부분은 evidence_gap에 명시하세요.

법률 분야:
${JSON.stringify(route, null, 2)}

검색 결과:
${JSON.stringify(searchResults, null, 2)}`,
    { responseSchema: evidenceSchema, maxOutputTokens: 2048 }
  );
}

export async function runAnswerAgent(
  intake: IntakeResult,
  route: LegalRouteResult,
  evidence: EvidenceResult
): Promise<AnswerResult> {
  return callGemini<AnswerResult>(
    `소상공인 법률정보 도우미의 Answer Agent입니다.

아래 근거 후보를 바탕으로 쉬운 설명과 체크리스트를 작성하세요.
금지: 승소 가능성 단정, 위법 단정, 소송 전략 지시, 계약 해지 지시.
반드시 다음 고지를 포함하세요: ${legalNotice}

상황:
${JSON.stringify(intake, null, 2)}

법률 분야:
${JSON.stringify(route, null, 2)}

근거 후보:
${JSON.stringify(evidence, null, 2)}`,
    { responseSchema: answerSchema, maxOutputTokens: 3072 }
  );
}

export async function runRiskGuardAgent(answer: AnswerResult): Promise<RiskCheckResult> {
  return callGemini<RiskCheckResult>(
    `소상공인 법률정보 도우미의 Risk Guard Agent입니다.

아래 답변을 점검하고 법률 자문처럼 보이는 표현을 완화하세요.
개인정보, 고객정보, 내부 URL, 계약서 원문 입력을 요구하는 표현도 제거하세요.

답변:
${JSON.stringify(answer, null, 2)}

고지문:
${legalNotice}`,
    { responseSchema: riskCheckSchema, maxOutputTokens: 2048 }
  );
}
