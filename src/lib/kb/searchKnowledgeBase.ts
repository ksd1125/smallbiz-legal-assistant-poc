import { DatabaseSync } from 'node:sqlite';

export interface KnowledgeTopic {
  id: number;
  topicName: string;
  description: string;
  keywords: string[];
}

export interface KnowledgeEvidenceItem {
  source: string;
  type: 'law_article';
  title: string;
  article: string;
  summary: string;
  url?: string;
  lawName: string;
  weight: number;
}

export interface KnowledgeSearchResult {
  topic: KnowledgeTopic;
  lawCandidates: string[];
  evidenceItems: KnowledgeEvidenceItem[];
}

function parseJsonArray(value: unknown) {
  if (typeof value !== 'string') return [];
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
}

function scoreTopic(question: string, keywords: string[]) {
  const normalized = question.replace(/\s+/g, ' ').trim().toLowerCase();
  return keywords.reduce((score, keyword) => (normalized.includes(keyword.toLowerCase()) ? score + 1 : score), 0);
}

function pickTopic(db: DatabaseSync, question: string): KnowledgeTopic {
  const rows = db.prepare('SELECT id, topic_name, description, keywords_json FROM topics').all();
  const ranked = rows
    .map((row) => {
      const keywords = parseJsonArray(row.keywords_json);
      return {
        id: Number(row.id),
        topicName: String(row.topic_name),
        description: String(row.description),
        keywords,
        score: scoreTopic(question, keywords)
      };
    })
    .sort((a, b) => b.score - a.score);
  const picked = ranked[0];
  if (!picked) {
    throw new Error('지식베이스에 등록된 주제가 없습니다.');
  }
  return { id: picked.id, topicName: picked.topicName, description: picked.description, keywords: picked.keywords };
}

export function searchKnowledgeBase(db: DatabaseSync, question: string): KnowledgeSearchResult {
  const topic = pickTopic(db, question);
  const rows = db
    .prepare(`
      SELECT l.law_name, l.source_url, a.article_no, a.article_title, a.article_text, at.weight
      FROM article_topics at
      JOIN articles a ON a.id = at.article_id
      JOIN laws l ON l.id = a.law_id
      WHERE at.topic_id = ?
      ORDER BY at.weight DESC, l.law_name ASC, a.article_no ASC
      LIMIT 6
    `)
    .all(topic.id);
  const lawCandidates = Array.from(new Set(rows.map((row) => String(row.law_name))));
  const evidenceItems = rows.map((row) => ({
    source: 'SQLite 지식베이스',
    type: 'law_article' as const,
    title: `${String(row.law_name)} ${String(row.article_title)}`,
    article: String(row.article_no),
    summary: String(row.article_text),
    url: typeof row.source_url === 'string' ? row.source_url : undefined,
    lawName: String(row.law_name),
    weight: Number(row.weight)
  }));
  return { topic, lawCandidates, evidenceItems };
}
