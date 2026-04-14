export type IssueCardId =
  | 'startup'
  | 'lease'
  | 'employment'
  | 'contract'
  | 'consumer'
  | 'debt'
  | 'administrative'
  | 'closure';

export interface IntakeInput {
  issueCard: IssueCardId;
  businessType: string;
  stage: string;
  question: string;
}

export interface IntakeResult {
  business_type: string;
  stage: string;
  issue_type: string[];
  urgency: '낮음' | '보통' | '높음';
  missing_info: string[];
  next_questions: string[];
}

export interface LegalRouteResult {
  legal_domains: string[];
  law_candidates: string[];
  search_queries: Array<{
    source: 'open_law';
    query: string;
    target: 'law' | 'prec' | 'expc' | 'decc';
  }>;
  reason: string;
}

export interface LawSearchResult {
  source: string;
  type: string;
  title: string;
  summary: string;
  url?: string;
  raw?: unknown;
}

export interface EvidenceResult {
  evidence_items: Array<{
    source: string;
    type: string;
    title: string;
    article?: string;
    summary: string;
    url?: string;
  }>;
  evidence_gap: string[];
}

export interface AnswerResult {
  summary: string;
  related_domains: string[];
  checklist: string[];
  cautions: string[];
  next_questions: string[];
  answer_markdown: string;
}

export interface RiskCheckResult {
  risk_level: 'low' | 'medium' | 'high';
  blocked_phrases: string[];
  safe_rewrite_required: boolean;
  notice: string;
  final_answer_markdown: string;
}
