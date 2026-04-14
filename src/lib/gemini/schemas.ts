export const intakeSchema = {
  type: 'object',
  properties: {
    business_type: { type: 'string' },
    stage: { type: 'string' },
    issue_type: { type: 'array', items: { type: 'string' } },
    urgency: { type: 'string', enum: ['낮음', '보통', '높음'] },
    missing_info: { type: 'array', items: { type: 'string' } },
    next_questions: { type: 'array', items: { type: 'string' } }
  },
  required: ['business_type', 'stage', 'issue_type', 'urgency', 'missing_info', 'next_questions']
};

export const legalRouteSchema = {
  type: 'object',
  properties: {
    legal_domains: { type: 'array', items: { type: 'string' } },
    law_candidates: { type: 'array', items: { type: 'string' } },
    search_queries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string', enum: ['open_law'] },
          query: { type: 'string' },
          target: { type: 'string', enum: ['law', 'prec', 'expc', 'decc'] }
        },
        required: ['source', 'query', 'target']
      }
    },
    reason: { type: 'string' }
  },
  required: ['legal_domains', 'law_candidates', 'search_queries', 'reason']
};

export const evidenceSchema = {
  type: 'object',
  properties: {
    evidence_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          type: { type: 'string' },
          title: { type: 'string' },
          article: { type: 'string' },
          summary: { type: 'string' },
          url: { type: 'string' }
        },
        required: ['source', 'type', 'title', 'summary']
      }
    },
    evidence_gap: { type: 'array', items: { type: 'string' } }
  },
  required: ['evidence_items', 'evidence_gap']
};

export const answerSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    related_domains: { type: 'array', items: { type: 'string' } },
    checklist: { type: 'array', items: { type: 'string' } },
    cautions: { type: 'array', items: { type: 'string' } },
    next_questions: { type: 'array', items: { type: 'string' } },
    answer_markdown: { type: 'string' }
  },
  required: ['summary', 'related_domains', 'checklist', 'cautions', 'next_questions', 'answer_markdown']
};

export const riskCheckSchema = {
  type: 'object',
  properties: {
    risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
    blocked_phrases: { type: 'array', items: { type: 'string' } },
    safe_rewrite_required: { type: 'boolean' },
    notice: { type: 'string' },
    final_answer_markdown: { type: 'string' }
  },
  required: ['risk_level', 'blocked_phrases', 'safe_rewrite_required', 'notice', 'final_answer_markdown']
};
