import { DatabaseSync } from 'node:sqlite';
import { openKnowledgeDb } from './db';
import { SEED_ARTICLES, SEED_LAWS, SEED_TEMPLATES, SEED_TOPICS } from './seedData';

const json = (value: unknown) => JSON.stringify(value);
const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim().toLowerCase();

export function seedKnowledgeBase(db: DatabaseSync) {
  const insertLaw = db.prepare(`INSERT OR IGNORE INTO laws (law_name, ministry, source_url, fetched_at) VALUES (?, ?, ?, datetime('now'))`);
  SEED_LAWS.forEach(([lawName, ministry, sourceUrl]) => insertLaw.run(lawName, ministry, sourceUrl));

  const insertTopic = db.prepare(`INSERT OR IGNORE INTO topics (topic_name, description, keywords_json, example_questions_json) VALUES (?, ?, ?, ?)`);
  SEED_TOPICS.forEach((topic) => insertTopic.run(topic.topicName, topic.description, json(topic.keywords), json(topic.exampleQuestions)));

  const insertTemplate = db.prepare(`INSERT OR IGNORE INTO answer_templates (topic_id, answer_title, answer_outline, checklist_json, next_questions_json, caution_text) SELECT id, ?, ?, ?, ?, ? FROM topics WHERE topic_name = ?`);
  SEED_TEMPLATES.forEach((template) => insertTemplate.run(template.answerTitle, template.answerOutline, json(template.checklist), json(template.nextQuestions), template.cautionText, template.topicName));

  const insertArticle = db.prepare(`INSERT OR IGNORE INTO articles (law_id, article_no, article_title, article_text, normalized_text) SELECT id, ?, ?, ?, ? FROM laws WHERE law_name = ?`);
  const linkArticleTopic = db.prepare(`INSERT OR REPLACE INTO article_topics (article_id, topic_id, weight, memo) SELECT a.id, t.id, ?, 'seed' FROM articles a JOIN laws l ON l.id = a.law_id JOIN topics t ON t.topic_name = ? WHERE l.law_name = ? AND a.article_no = ? AND a.article_title = ?`);
  const insertFts = db.prepare(`INSERT OR REPLACE INTO article_fts(rowid, title, body, law_name) SELECT a.id, a.article_title, a.article_text, l.law_name FROM articles a JOIN laws l ON l.id = a.law_id WHERE l.law_name = ? AND a.article_no = ? AND a.article_title = ?`);

  SEED_ARTICLES.forEach(([lawName, articleNo, articleTitle, articleText, topicName, weight]) => {
    insertArticle.run(articleNo, articleTitle, articleText, normalizeText(`${articleTitle} ${articleText}`), lawName);
    linkArticleTopic.run(weight, topicName, lawName, articleNo, articleTitle);
    insertFts.run(lawName, articleNo, articleTitle);
  });
}

export function initializeKnowledgeBase() {
  const db = openKnowledgeDb();
  try {
    seedKnowledgeBase(db);
    return {
      lawCount: db.prepare('SELECT COUNT(*) AS count FROM laws').get()?.count ?? 0,
      articleCount: db.prepare('SELECT COUNT(*) AS count FROM articles').get()?.count ?? 0,
      topicCount: db.prepare('SELECT COUNT(*) AS count FROM topics').get()?.count ?? 0
    };
  } finally {
    db.close();
  }
}
