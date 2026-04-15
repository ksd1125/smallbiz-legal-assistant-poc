import { DatabaseSync } from 'node:sqlite';
import { appendLegalNotice } from '@/lib/safety/legalRiskGuard';
import type { AnswerResult, EvidenceResult, IntakeInput, IntakeResult, LegalRouteResult, RiskCheckResult } from '@/types/legalAssistant';
import { searchKnowledgeBase, type KnowledgeSearchResult } from './searchKnowledgeBase';

interface TemplateRow {
  answer_outline: string;
  checklist_json: string;
  next_questions_json: string;
  caution_text: string;
}

export interface KnowledgeAnswerBundle {
  intake: IntakeResult;
  route: LegalRouteResult;
  evidence: EvidenceResult;
  answer: AnswerResult;
  risk: RiskCheckResult;
}

function parseJsonArray(value: string) {
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
}

function getTemplate(db: DatabaseSync, topicId: number): TemplateRow {
  const row = db
    .prepare('SELECT answer_outline, checklist_json, next_questions_json, caution_text FROM answer_templates WHERE topic_id = ?')
    .get(topicId) as TemplateRow | undefined;
  if (!row) {
    throw new Error('선택된 주제의 답변 템플릿이 없습니다.');
  }
  return row;
}

function buildMarkdown(summary: string, checklist: string[], evidence: EvidenceResult, cautions: string[]) {
  return [
    summary,
    '',
    '[체크리스트]',
    ...checklist.map((item) => `- ${item}`),
    '',
    '[공식 근거 후보]',
    ...evidence.evidence_items.map((item) => `- ${item.title}: ${item.summary}`),
    '',
    '[주의]',
    ...cautions.map((item) => `- ${item}`)
  ].join('\n');
}

export function buildKnowledgeAnswer(
  db: DatabaseSync,
  input: IntakeInput,
  searcher: typeof searchKnowledgeBase = searchKnowledgeBase
): KnowledgeAnswerBundle {
  const search: KnowledgeSearchResult = searcher(db, input.question || input.interestIssue || input.issueCard);
  const template = getTemplate(db, search.topic.id);
  const checklist = parseJsonArray(template.checklist_json);
  const nextQuestions = parseJsonArray(template.next_questions_json);
  const intake: IntakeResult = {
    business_type: input.businessType || '업종 미입력',
    stage: input.stage || '단계 미입력',
    stakeholder: input.stakeholder || '관계자 미입력',
    document_status: input.documentStatus || '문서 상태 미입력',
    interest_issue: input.interestIssue || input.question || search.topic.topicName,
    intake_mode: input.intakeMode,
    issue_type: [search.topic.topicName],
    urgency: '보통',
    missing_info: [],
    next_questions: nextQuestions
  };
  const route: LegalRouteResult = {
    legal_domains: [search.topic.topicName],
    law_candidates: search.lawCandidates,
    search_queries: search.lawCandidates.map((lawName) => ({ source: 'open_law', query: lawName, target: 'law' })),
    reason: 'SQLite 지식베이스에서 질문 키워드와 연결된 주제를 선택했습니다.'
  };
  const evidence: EvidenceResult = {
    evidence_items: search.evidenceItems.map((item) => ({
      source: item.source,
      type: item.type,
      title: item.title,
      article: item.article,
      summary: item.summary,
      url: item.url
    })),
    evidence_gap: []
  };
  const cautions = [template.caution_text, '아래 내용은 법률정보 탐색을 돕기 위한 참고자료이며, 개별 사건에 대한 법률 자문은 아닙니다.'];
  const answerMarkdown = buildMarkdown(template.answer_outline, checklist, evidence, cautions);
  const answer: AnswerResult = {
    summary: template.answer_outline,
    related_domains: route.legal_domains,
    checklist,
    cautions,
    next_questions: nextQuestions,
    answer_markdown: answerMarkdown
  };
  const risk: RiskCheckResult = {
    risk_level: 'low',
    blocked_phrases: [],
    safe_rewrite_required: false,
    notice: 'SQLite 지식베이스 답변은 법률정보 안내로 표시됩니다.',
    final_answer_markdown: appendLegalNotice(answerMarkdown)
  };
  return { intake, route, evidence, answer, risk };
}
