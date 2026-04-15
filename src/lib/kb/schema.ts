export const KNOWLEDGE_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS laws (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    law_name TEXT NOT NULL UNIQUE,
    law_id TEXT,
    mst TEXT,
    ministry TEXT,
    effective_date TEXT,
    source_url TEXT,
    fetched_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    law_id INTEGER NOT NULL,
    article_no TEXT NOT NULL,
    article_title TEXT NOT NULL,
    article_text TEXT NOT NULL,
    chapter_title TEXT,
    effective_date TEXT,
    normalized_text TEXT NOT NULL,
    FOREIGN KEY (law_id) REFERENCES laws(id),
    UNIQUE(law_id, article_no, article_title)
  )`,
  `CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    keywords_json TEXT NOT NULL,
    example_questions_json TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS article_topics (
    article_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    weight REAL NOT NULL DEFAULT 1,
    memo TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (article_id, topic_id)
  )`,
  `CREATE TABLE IF NOT EXISTS answer_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL UNIQUE,
    answer_title TEXT NOT NULL,
    answer_outline TEXT NOT NULL,
    checklist_json TEXT NOT NULL,
    next_questions_json TEXT NOT NULL,
    caution_text TEXT NOT NULL
  )`,
  `CREATE VIRTUAL TABLE IF NOT EXISTS article_fts USING fts5(title, body, law_name, content='')`,
  `CREATE INDEX IF NOT EXISTS idx_articles_law_id ON articles(law_id)`,
  `CREATE INDEX IF NOT EXISTS idx_article_topics_topic_id ON article_topics(topic_id)`
];
