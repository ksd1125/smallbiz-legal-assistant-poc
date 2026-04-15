# SQLite Legal Knowledge Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 국가법령정보 Open API를 답변 시점 조회용이 아니라 SQLite 지식베이스 갱신용으로 바꾸고, 사용자의 질문에는 로컬 DB 근거와 템플릿으로 먼저 답하게 만든다.

**Architecture:** Node 24 내장 `node:sqlite`로 `data/legal-knowledge.sqlite`를 만들고 법령, 조문, 주제, 답변 템플릿을 저장한다. 화면은 `/api/knowledge-answer`를 먼저 호출해 DB 기반 답변을 받고, Gemini와 실시간 법령 조회는 보조 수단으로 남긴다.

**Tech Stack:** Next.js 16, React 18, TypeScript 5.5, Node 24 `node:sqlite`, SQLite 파일 DB, 기존 Node 테스트 스크립트

---

## File Structure

- Create: `src/types/node-sqlite.d.ts` - `node:sqlite` 최소 타입 선언.
- Create: `src/lib/kb/schema.ts` - SQLite 테이블과 색인 SQL.
- Create: `src/lib/kb/db.ts` - DB 열기, 스키마 적용, 테스트용 인메모리 DB.
- Create: `src/lib/kb/seedData.ts` - 1차 법령 10개, 주제, 키워드, 답변 템플릿, 검증용 조문 요약.
- Create: `src/lib/kb/initKnowledgeBase.ts` - seed 데이터를 SQLite에 입력.
- Create: `src/lib/kb/searchKnowledgeBase.ts` - 질문을 주제로 분류하고 근거 후보를 조회.
- Create: `src/lib/kb/buildKnowledgeAnswer.ts` - 화면이 쓰는 `intake`, `route`, `evidence`, `answer`, `risk` 묶음 생성.
- Create: `src/app/api/knowledge-answer/route.ts` - SQLite 기반 답변 API.
- Create: `tests/kb-schema.test.js`, `tests/kb-seed.test.js`, `tests/kb-search.test.js`, `tests/kb-answer.test.js`, `tests/run-kb-init.js`.
- Modify: `.gitignore`, `package.json`, `src/app/page.tsx`, `WORKLOG.md`.

---

## Task 1: SQLite Schema And DB Helper

**Files:**
- Create: `src/types/node-sqlite.d.ts`
- Create: `src/lib/kb/schema.ts`
- Create: `src/lib/kb/db.ts`
- Create: `tests/kb-schema.test.js`
- Modify: `.gitignore`

- [ ] **Step 1: Write the failing schema test**

Create `tests/kb-schema.test.js`:

```javascript
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relativePath, stubs = {}) {
  const sourcePath = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const sandbox = {
    exports: {},
    require(name) {
      if (stubs[name]) return stubs[name];
      return require(name);
    },
    __dirname: path.dirname(sourcePath),
    process
  };
  vm.runInNewContext(compiled, sandbox, { filename: sourcePath });
  return sandbox.exports;
}

const schema = load('src/lib/kb/schema.ts');
assert(schema.KNOWLEDGE_SCHEMA.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS laws')));
assert(schema.KNOWLEDGE_SCHEMA.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS articles')));
assert(schema.KNOWLEDGE_SCHEMA.some((sql) => sql.includes('CREATE VIRTUAL TABLE IF NOT EXISTS article_fts')));

const dbModule = load('src/lib/kb/db.ts', { './schema': schema });
const db = dbModule.createInMemoryKnowledgeDb();
const names = db.prepare("SELECT name FROM sqlite_master WHERE type IN ('table','virtual table')").all().map((row) => row.name);
assert(names.includes('laws'));
assert(names.includes('articles'));
assert(names.includes('topics'));
assert(names.includes('answer_templates'));
assert(names.includes('article_fts'));
db.close();
```

- [ ] **Step 2: Run the schema test and verify it fails**

Run: `node tests/kb-schema.test.js`

Expected: FAIL because `src/lib/kb/schema.ts` does not exist.

- [ ] **Step 3: Add Node SQLite type declaration**

Create `src/types/node-sqlite.d.ts`:

```typescript
declare module 'node:sqlite' {
  export class StatementSync {
    all(...params: unknown[]): Array<Record<string, unknown>>;
    get(...params: unknown[]): Record<string, unknown> | undefined;
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  }
  export class DatabaseSync {
    constructor(location: string);
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
```

- [ ] **Step 4: Add schema SQL**

Create `src/lib/kb/schema.ts`:

```typescript
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
```

- [ ] **Step 5: Add DB helper**

Create `src/lib/kb/db.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { KNOWLEDGE_SCHEMA } from './schema';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'legal-knowledge.sqlite');

export function getKnowledgeDbPath() {
  return DB_PATH;
}

export function applyKnowledgeSchema(db: DatabaseSync) {
  db.exec('PRAGMA foreign_keys = ON');
  for (const sql of KNOWLEDGE_SCHEMA) db.exec(sql);
}

export function openKnowledgeDb() {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  applyKnowledgeSchema(db);
  return db;
}

export function createInMemoryKnowledgeDb() {
  const db = new DatabaseSync(':memory:');
  applyKnowledgeSchema(db);
  return db;
}
```

- [ ] **Step 6: Ignore generated DB files**

Add this block to `.gitignore` after the `.env` lines:

```gitignore
# Generated local knowledge base
data/*.sqlite
data/*.sqlite-*
```

- [ ] **Step 7: Run and commit**

Run: `node tests/kb-schema.test.js`

Expected: PASS with no assertion output. Then run:

```powershell
git add .gitignore src/types/node-sqlite.d.ts src/lib/kb/schema.ts src/lib/kb/db.ts tests/kb-schema.test.js
git commit -m "Add SQLite knowledge base schema"
```

---

## Task 2: Seed Laws, Topics, Templates, And Sample Evidence

**Files:**
- Create: `src/lib/kb/seedData.ts`
- Create: `src/lib/kb/initKnowledgeBase.ts`
- Create: `tests/kb-seed.test.js`

- [ ] **Step 1: Write the failing seed test**

Create `tests/kb-seed.test.js`:

```javascript
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relativePath, stubs = {}) {
  const sourcePath = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const sandbox = {
    exports: {},
    require(name) {
      if (stubs[name]) return stubs[name];
      return require(name);
    },
    __dirname: path.dirname(sourcePath),
    process
  };
  vm.runInNewContext(compiled, sandbox, { filename: sourcePath });
  return sandbox.exports;
}

const schema = load('src/lib/kb/schema.ts');
const dbModule = load('src/lib/kb/db.ts', { './schema': schema });
const seedData = load('src/lib/kb/seedData.ts');
const init = load('src/lib/kb/initKnowledgeBase.ts', { './seedData': seedData });

const db = dbModule.createInMemoryKnowledgeDb();
init.seedKnowledgeBase(db);
assert.equal(db.prepare('SELECT COUNT(*) AS count FROM laws').get().count, 10);
assert(db.prepare("SELECT id FROM laws WHERE law_name = '상가건물 임대차보호법'").get());
assert(db.prepare("SELECT id FROM topics WHERE topic_name = '상가 계약 전 검토'").get());
assert(db.prepare("SELECT id FROM answer_templates WHERE answer_title = '상가 계약 전 확인사항'").get());
assert(db.prepare("SELECT id FROM articles WHERE article_title LIKE '%계약 전 확인%'").get());
db.close();
```

- [ ] **Step 2: Run the seed test and verify it fails**

Run: `node tests/kb-seed.test.js`

Expected: FAIL because `src/lib/kb/seedData.ts` does not exist.

- [ ] **Step 3: Add seed data**

Create `src/lib/kb/seedData.ts` with these exported arrays:

```typescript
export const SEED_LAWS = [
  ['상가건물 임대차보호법', '법무부', 'https://www.law.go.kr/법령/상가건물임대차보호법'],
  ['민법', '법무부', 'https://www.law.go.kr/법령/민법'],
  ['근로기준법', '고용노동부', 'https://www.law.go.kr/법령/근로기준법'],
  ['최저임금법', '고용노동부', 'https://www.law.go.kr/법령/최저임금법'],
  ['근로자퇴직급여 보장법', '고용노동부', 'https://www.law.go.kr/법령/근로자퇴직급여보장법'],
  ['전자상거래 등에서의 소비자보호에 관한 법률', '공정거래위원회', 'https://www.law.go.kr/법령/전자상거래등에서의소비자보호에관한법률'],
  ['소비자기본법', '공정거래위원회', 'https://www.law.go.kr/법령/소비자기본법'],
  ['식품위생법', '식품의약품안전처', 'https://www.law.go.kr/법령/식품위생법'],
  ['소액사건심판법', '법무부', 'https://www.law.go.kr/법령/소액사건심판법'],
  ['행정절차법', '법제처', 'https://www.law.go.kr/법령/행정절차법']
] as const;

export const SEED_TOPICS = [
  {
    topicName: '상가 계약 전 검토',
    description: '상가 임대차 계약 체결 전 확인사항',
    keywords: ['상가', '임대차', '임대인', '임차인', '보증금', '월차임', '권리금', '원상복구', '관리비', '계약갱신', '중도해지'],
    exampleQuestions: ['상가 계약 전 검토 사항이 있다면?', '가게 임대차 계약서에서 무엇을 봐야 하나요?']
  },
  {
    topicName: '아르바이트 근로계약',
    description: '아르바이트 채용 시 근로계약서, 임금, 휴게, 주휴수당 확인',
    keywords: ['아르바이트', '알바', '근로계약', '임금', '시급', '주휴수당', '휴게', '최저임금'],
    exampleQuestions: ['아르바이트 근로계약서 작성 시 확인할 것은?']
  },
  {
    topicName: '온라인 판매 환불',
    description: '전자상거래 판매자의 청약철회와 환불 기준 확인',
    keywords: ['환불', '반품', '청약철회', '온라인', '통신판매', '전자상거래', '소비자'],
    exampleQuestions: ['고객 환불 요청이 들어오면 어떤 기준을 확인해야 하나?']
  },
  {
    topicName: '행정처분 대응',
    description: '영업정지, 과태료 등 처분 전 의견제출과 기한 확인',
    keywords: ['영업정지', '과태료', '행정처분', '의견제출', '사전통지', '처분서', '기한'],
    exampleQuestions: ['영업정지 처분 통지를 받으면 무엇을 확인해야 하나요?']
  }
];

export const SEED_TEMPLATES = [
  {
    topicName: '상가 계약 전 검토',
    answerTitle: '상가 계약 전 확인사항',
    answerOutline: '상가 계약 전에는 보증금과 월차임, 계약기간, 갱신 조건, 권리금, 원상복구, 관리비, 업종 제한, 중도해지 조건을 먼저 확인해야 합니다.',
    checklist: ['주소와 실제 사용 공간 확인', '보증금·월차임·관리비·부가세 확인', '계약기간과 갱신 조건 확인', '권리금과 시설 인수 범위 확인', '원상복구 범위 확인', '업종 제한과 인허가 가능성 확인', '중도해지·양도·전대 조건 확인'],
    nextQuestions: ['계약서 초안에 특약이 있나요?', '보증금과 월차임은 얼마인가요?', '권리금이나 시설 인수금이 있나요?'],
    cautionText: '계약서 특약과 실제 점포 상태에 따라 결론이 달라질 수 있으므로 서명 전 원문 확인이 필요합니다.'
  },
  {
    topicName: '아르바이트 근로계약',
    answerTitle: '아르바이트 근로계약 확인사항',
    answerOutline: '아르바이트 채용 시 근로계약서 작성, 임금, 근로시간, 휴게시간, 주휴수당, 최저임금 준수 여부를 확인해야 합니다.',
    checklist: ['근로계약서 작성', '최저임금 이상 지급 확인', '근로시간과 휴게시간 구분', '주휴수당 발생 가능성 확인', '임금 지급일과 지급 방식 확인'],
    nextQuestions: ['주 몇 시간 근무하나요?', '근로계약서 작성 전인가요?', '임금은 시급인가요 월급인가요?'],
    cautionText: '연소자 고용, 야간근로, 4대보험 여부는 별도 확인이 필요합니다.'
  },
  {
    topicName: '온라인 판매 환불',
    answerTitle: '환불 요청 확인사항',
    answerOutline: '환불 요청이 들어오면 판매 방식, 청약철회 가능 기간, 상품 훼손 여부, 표시·광고 내용, 배송비 부담 기준을 확인해야 합니다.',
    checklist: ['온라인 판매 여부 확인', '상품 수령일과 환불 요청일 확인', '사용 또는 훼손 여부 확인', '환불 제한 고지 확인', '배송비 부담 기준 확인'],
    nextQuestions: ['상품 수령일은 언제인가요?', '상품을 사용했나요?', '환불 제한 조건을 고지했나요?'],
    cautionText: '상품 종류와 판매 방식에 따라 청약철회 제한 사유가 달라질 수 있습니다.'
  },
  {
    topicName: '행정처분 대응',
    answerTitle: '행정처분 통지 확인사항',
    answerOutline: '행정처분 통지를 받으면 처분명, 처분 사유, 의견제출 기한, 불복 절차, 제출 증빙을 먼저 확인해야 합니다.',
    checklist: ['수령일과 마감일 확인', '처분 사유와 적용 법령 확인', '증빙자료 정리', '의견제출·이의신청 기한 확인', '즉시 영향이 있는 처분인지 확인'],
    nextQuestions: ['수령일은 언제인가요?', '처분명이 무엇인가요?', '증빙자료가 있나요?'],
    cautionText: '행정처분은 기한을 놓치면 대응 선택지가 줄어들 수 있으므로 날짜 확인이 중요합니다.'
  }
];

export const SEED_ARTICLES = [
  ['상가건물 임대차보호법', '기초-상가-1', '상가 계약 전 확인', '상가 임대차 계약 전에는 보증금, 월차임, 계약기간, 갱신요구, 권리금, 원상복구, 관리비, 업종 제한, 중도해지 조건을 확인한다.', '상가 계약 전 검토', 1],
  ['민법', '기초-계약-1', '계약 일반 확인', '계약은 당사자, 목적물, 대금, 이행기한, 해제 조건, 손해배상 조건을 확인해야 한다.', '상가 계약 전 검토', 0.7],
  ['근로기준법', '기초-근로-1', '근로계약서 작성 확인', '근로계약 시 임금, 근로시간, 휴게, 휴일, 업무내용 등 주요 근로조건을 명확히 확인한다.', '아르바이트 근로계약', 1],
  ['최저임금법', '기초-임금-1', '최저임금 확인', '근로자에게 지급하는 임금은 최저임금 기준 이상인지 확인해야 한다.', '아르바이트 근로계약', 0.8],
  ['전자상거래 등에서의 소비자보호에 관한 법률', '기초-환불-1', '온라인 판매 환불 확인', '전자상거래 환불 요청은 청약철회 가능 기간, 상품 훼손 여부, 환불 제한 고지, 배송비 부담 기준을 확인한다.', '온라인 판매 환불', 1],
  ['행정절차법', '기초-처분-1', '행정처분 의견제출 확인', '행정처분 전 사전통지, 의견제출 기한, 처분 사유, 불복 절차를 확인한다.', '행정처분 대응', 1]
] as const;
```

- [ ] **Step 4: Add seed initializer**

Create `src/lib/kb/initKnowledgeBase.ts`:

```typescript
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
  const insertFts = db.prepare(`INSERT INTO article_fts(rowid, title, body, law_name) SELECT a.id, a.article_title, a.article_text, l.law_name FROM articles a JOIN laws l ON l.id = a.law_id WHERE l.law_name = ? AND a.article_no = ? AND a.article_title = ?`);

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
```

- [ ] **Step 5: Run and commit**

Run: `node tests/kb-seed.test.js`

Expected: PASS with no assertion output. Then run:

```powershell
git add src/lib/kb/seedData.ts src/lib/kb/initKnowledgeBase.ts tests/kb-seed.test.js
git commit -m "Seed SQLite legal knowledge base"
```

---

## Task 3: Topic Search And Evidence Retrieval

**Files:**
- Create: `src/lib/kb/searchKnowledgeBase.ts`
- Create: `tests/kb-search.test.js`

- [ ] **Step 1: Write the failing search test**

Create `tests/kb-search.test.js`:

```javascript
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relativePath, stubs = {}) {
  const sourcePath = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const sandbox = {
    exports: {},
    require(name) {
      if (stubs[name]) return stubs[name];
      return require(name);
    },
    __dirname: path.dirname(sourcePath),
    process
  };
  vm.runInNewContext(compiled, sandbox, { filename: sourcePath });
  return sandbox.exports;
}

const schema = load('src/lib/kb/schema.ts');
const dbModule = load('src/lib/kb/db.ts', { './schema': schema });
const seedData = load('src/lib/kb/seedData.ts');
const init = load('src/lib/kb/initKnowledgeBase.ts', { './seedData': seedData });
const search = load('src/lib/kb/searchKnowledgeBase.ts');

const db = dbModule.createInMemoryKnowledgeDb();
init.seedKnowledgeBase(db);
const lease = search.searchKnowledgeBase(db, '상가 계약 전 검토 사항이 있다면?');
assert.equal(lease.topic.topicName, '상가 계약 전 검토');
assert(lease.lawCandidates.includes('상가건물 임대차보호법'));
assert(lease.evidenceItems.some((item) => item.title.includes('상가 계약 전 확인')));
const employment = search.searchKnowledgeBase(db, '아르바이트 근로계약서 작성 시 확인할 것은?');
assert.equal(employment.topic.topicName, '아르바이트 근로계약');
assert(employment.lawCandidates.includes('근로기준법'));
const refund = search.searchKnowledgeBase(db, '고객 환불 요청이 들어오면 어떤 기준을 확인해야 하나?');
assert.equal(refund.topic.topicName, '온라인 판매 환불');
assert(refund.lawCandidates.includes('전자상거래 등에서의 소비자보호에 관한 법률'));
db.close();
```

- [ ] **Step 2: Run the search test and verify it fails**

Run: `node tests/kb-search.test.js`

Expected: FAIL because `searchKnowledgeBase` is not defined.

- [ ] **Step 3: Add search module**

Create `src/lib/kb/searchKnowledgeBase.ts`:

```typescript
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
  return keywords.reduce((score, keyword) => normalized.includes(keyword.toLowerCase()) ? score + 1 : score, 0);
}

function pickTopic(db: DatabaseSync, question: string): KnowledgeTopic {
  const rows = db.prepare('SELECT id, topic_name, description, keywords_json FROM topics').all();
  const ranked = rows.map((row) => ({
    id: Number(row.id),
    topicName: String(row.topic_name),
    description: String(row.description),
    keywords: parseJsonArray(row.keywords_json),
    score: scoreTopic(question, parseJsonArray(row.keywords_json))
  })).sort((a, b) => b.score - a.score);
  const picked = ranked[0];
  if (!picked) throw new Error('지식베이스에 등록된 주제가 없습니다.');
  return { id: picked.id, topicName: picked.topicName, description: picked.description, keywords: picked.keywords };
}

export function searchKnowledgeBase(db: DatabaseSync, question: string): KnowledgeSearchResult {
  const topic = pickTopic(db, question);
  const rows = db.prepare(`
    SELECT l.law_name, l.source_url, a.article_no, a.article_title, a.article_text, at.weight
    FROM article_topics at
    JOIN articles a ON a.id = at.article_id
    JOIN laws l ON l.id = a.law_id
    WHERE at.topic_id = ?
    ORDER BY at.weight DESC, l.law_name ASC, a.article_no ASC
    LIMIT 6
  `).all(topic.id);
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
```

- [ ] **Step 4: Run and commit**

Run: `node tests/kb-search.test.js`

Expected: PASS with no assertion output. Then run:

```powershell
git add src/lib/kb/searchKnowledgeBase.ts tests/kb-search.test.js
git commit -m "Add SQLite knowledge search"
```

---

## Task 4: Build Screen-Ready Answer Bundle

**Files:**
- Create: `src/lib/kb/buildKnowledgeAnswer.ts`
- Create: `tests/kb-answer.test.js`

- [ ] **Step 1: Write the failing answer test**

Create `tests/kb-answer.test.js`:

```javascript
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relativePath, stubs = {}) {
  const sourcePath = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const sandbox = {
    exports: {},
    require(name) {
      if (stubs[name]) return stubs[name];
      return require(name);
    },
    __dirname: path.dirname(sourcePath),
    process
  };
  vm.runInNewContext(compiled, sandbox, { filename: sourcePath });
  return sandbox.exports;
}

const schema = load('src/lib/kb/schema.ts');
const dbModule = load('src/lib/kb/db.ts', { './schema': schema });
const seedData = load('src/lib/kb/seedData.ts');
const init = load('src/lib/kb/initKnowledgeBase.ts', { './seedData': seedData });
const search = load('src/lib/kb/searchKnowledgeBase.ts');
const builder = load('src/lib/kb/buildKnowledgeAnswer.ts', {
  '@/types/legalAssistant': {},
  '@/lib/safety/legalRiskGuard': {
    appendLegalNotice: (text) => text.includes('법률 자문이 아닙니다') ? text : `${text}\n\n아래 내용은 법률정보 탐색을 돕기 위한 참고자료이며, 개별 사건에 대한 법률 자문이 아닙니다.`
  },
  './searchKnowledgeBase': search
});

const db = dbModule.createInMemoryKnowledgeDb();
init.seedKnowledgeBase(db);
const bundle = builder.buildKnowledgeAnswer(db, {
  issueCard: 'startup',
  intakeMode: 'open',
  businessType: '',
  stage: '창업 전',
  stakeholder: '',
  documentStatus: '아직 없음',
  interestIssue: '',
  question: '상가 계약 전 검토 사항이 있다면?'
}, search.searchKnowledgeBase);
assert(bundle.intake.issue_type.includes('상가 계약 전 검토'));
assert(bundle.route.law_candidates.includes('상가건물 임대차보호법'));
assert(bundle.evidence.evidence_items.some((item) => item.title.includes('상가건물 임대차보호법')));
assert(bundle.answer.summary.includes('상가 계약 전'));
assert(bundle.answer.checklist.some((item) => item.includes('권리금')));
assert(bundle.answer.answer_markdown.includes('공식 근거 후보'));
assert.equal(bundle.risk.risk_level, 'low');
assert(bundle.risk.final_answer_markdown.includes('법률 자문이 아닙니다'));
db.close();
```

- [ ] **Step 2: Run the answer test and verify it fails**

Run: `node tests/kb-answer.test.js`

Expected: FAIL because `buildKnowledgeAnswer` is not defined.

- [ ] **Step 3: Add answer builder**

Create `src/lib/kb/buildKnowledgeAnswer.ts`:

```typescript
import { DatabaseSync } from 'node:sqlite';
import type { AnswerResult, EvidenceResult, IntakeInput, IntakeResult, LegalRouteResult, RiskCheckResult } from '@/types/legalAssistant';
import { appendLegalNotice } from '@/lib/safety/legalRiskGuard';
import { searchKnowledgeBase, type KnowledgeSearchResult } from './searchKnowledgeBase';

interface TemplateRow {
  answer_outline: string;
  checklist_json: string;
  next_questions_json: string;
  caution_text: string;
}

function parseJsonArray(value: string) {
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
}

function getTemplate(db: DatabaseSync, topicId: number): TemplateRow {
  const row = db.prepare('SELECT answer_outline, checklist_json, next_questions_json, caution_text FROM answer_templates WHERE topic_id = ?').get(topicId) as TemplateRow | undefined;
  if (!row) throw new Error('선택된 주제의 답변 템플릿이 없습니다.');
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

export function buildKnowledgeAnswer(db: DatabaseSync, input: IntakeInput, searcher: typeof searchKnowledgeBase = searchKnowledgeBase) {
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
    evidence_items: search.evidenceItems.map((item) => ({ source: item.source, type: item.type, title: item.title, article: item.article, summary: item.summary, url: item.url })),
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
```

- [ ] **Step 4: Run and commit**

Run: `node tests/kb-answer.test.js`

Expected: PASS with no assertion output. Then run:

```powershell
git add src/lib/kb/buildKnowledgeAnswer.ts tests/kb-answer.test.js
git commit -m "Build SQLite knowledge answers"
```

---

## Task 5: Add Knowledge Answer API And Use It From The Page

**Files:**
- Create: `src/app/api/knowledge-answer/route.ts`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add API route**

Create `src/app/api/knowledge-answer/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { buildKnowledgeAnswer } from '@/lib/kb/buildKnowledgeAnswer';
import { openKnowledgeDb } from '@/lib/kb/db';
import { seedKnowledgeBase } from '@/lib/kb/initKnowledgeBase';
import type { IntakeInput } from '@/types/legalAssistant';

export async function POST(request: Request) {
  try {
    const input = await request.json() as IntakeInput;
    const db = openKnowledgeDb();
    try {
      seedKnowledgeBase(db);
      return NextResponse.json(buildKnowledgeAnswer(db, input));
    } finally {
      db.close();
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'SQLite 지식베이스 답변 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Add page result type**

In `src/app/page.tsx`, add this interface below the type imports:

```typescript
interface KnowledgeAnswerApiResult {
  intake: IntakeResult;
  route: LegalRouteResult;
  evidence: EvidenceResult;
  answer: AnswerResult;
  risk: RiskCheckResult;
}
```

- [ ] **Step 3: Replace the old sequential API flow**

In `src/app/page.tsx`, replace `runFlow` with:

```typescript
async function runFlow() {
  setLoading(true);
  setMessage('SQLite 지식베이스에서 관련 법률정보를 찾는 중입니다.');
  try {
    const bundle = await postJson<KnowledgeAnswerApiResult>('/api/knowledge-answer', input);
    setIntake(bundle.intake);
    setRoute(bundle.route);
    setEvidence(bundle.evidence);
    setAnswer(bundle.answer);
    setRisk(bundle.risk);
    setMessage('확인이 끝났습니다.');
  } catch (error) {
    setMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
}
```

- [ ] **Step 4: Run typecheck and commit**

Run: `npm.cmd run typecheck`

Expected: PASS with no TypeScript errors. Then run:

```powershell
git add src/app/api/knowledge-answer/route.ts src/app/page.tsx
git commit -m "Use SQLite knowledge answer API"
```

---

## Task 6: Scripts, Smoke Verification, And Worklog

**Files:**
- Create: `tests/run-kb-init.js`
- Modify: `package.json`
- Modify: `WORKLOG.md`

- [ ] **Step 1: Add CLI runner for DB initialization**

Create `tests/run-kb-init.js`:

```javascript
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relativePath, stubs = {}) {
  const sourcePath = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const sandbox = {
    exports: {},
    require(name) {
      if (stubs[name]) return stubs[name];
      return require(name);
    },
    __dirname: path.dirname(sourcePath),
    process,
    console
  };
  vm.runInNewContext(compiled, sandbox, { filename: sourcePath });
  return sandbox.exports;
}

const schema = load('src/lib/kb/schema.ts');
const dbModule = load('src/lib/kb/db.ts', { './schema': schema });
const seedData = load('src/lib/kb/seedData.ts');
const init = load('src/lib/kb/initKnowledgeBase.ts', { './db': dbModule, './seedData': seedData });
const result = init.initializeKnowledgeBase();
console.log(`Knowledge base ready: laws=${result.lawCount}, articles=${result.articleCount}, topics=${result.topicCount}`);
```

- [ ] **Step 2: Update package scripts**

In `package.json`, add:

```json
"test:kb": "node tests/kb-schema.test.js && node tests/kb-seed.test.js && node tests/kb-search.test.js && node tests/kb-answer.test.js",
"kb:init": "node tests/run-kb-init.js",
"kb:verify": "node tests/kb-search.test.js && node tests/kb-answer.test.js"
```

Also append `&& npm.cmd run test:kb` to the existing `test` script.

- [ ] **Step 3: Initialize the local DB**

Run: `npm.cmd run kb:init`

Expected output:

```text
Knowledge base ready: laws=10, articles=6, topics=4
```

The file `data/legal-knowledge.sqlite` should exist locally and should not appear in `git status`.

- [ ] **Step 4: Run verification commands**

Run these commands:

```powershell
npm.cmd run test:kb
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Expected: all commands PASS. `node:sqlite` may print an experimental warning; that warning is acceptable if tests and build pass.

- [ ] **Step 5: Manual browser smoke test**

Run: `npm.cmd run dev`

Open the printed local URL and submit:

```text
상가 계약 전 검토 사항이 있다면?
```

Expected screen result:

- 요약 includes `보증금`, `월차임`, `계약기간`, `권리금`, `원상복구`.
- 공식 근거 includes `상가건물 임대차보호법`.
- 체크리스트 includes at least 5 items.
- HWP/Excel 복사용 contains the same summary and checklist.

- [ ] **Step 6: Update worklog**

Add this entry to the top of `WORKLOG.md`:

```markdown
## 2026-04-15 SQLite 지식베이스 1차 구현

- 국가법령정보 API를 답변 시점 실시간 조회가 아니라 SQLite 지식베이스 갱신용으로 쓰는 구조를 적용했다.
- Node 24 내장 `node:sqlite` 기반으로 `data/legal-knowledge.sqlite`를 생성한다.
- 1차 seed에는 소상공인 핵심 법령 10개, 검증 주제 4개, 답변 템플릿 4개를 넣었다.
- 화면의 기본 답변 흐름은 `/api/knowledge-answer`를 먼저 사용한다.
- 확인 명령: `npm.cmd run test:kb`, `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`
```

- [ ] **Step 7: Commit final verification work**

Run:

```powershell
git add package.json tests/run-kb-init.js WORKLOG.md
git commit -m "Verify SQLite knowledge base flow"
```

If `package-lock.json` changed, include it in the same commit.

---

## Self-Review

- Spec coverage:
  - 실시간 조회서비스 중심 구조 제거: Task 5에서 `/api/knowledge-answer` 우선 호출로 반영.
  - SQLite 방식: Task 1과 Task 2에서 DB 스키마와 seed로 반영.
  - “상가 계약 전 검토 사항” 예시 답변: Task 3과 Task 4의 테스트로 고정.
  - Gemini 429 대응: Task 5에서 Gemini 호출 없는 기본 답변 경로로 반영.
- Placeholder scan:
  - 미정 표시나 빈칸 채우기 지시는 사용하지 않았다.
- Type consistency:
  - `searchKnowledgeBase(db, question)` returns `KnowledgeSearchResult`.
  - `buildKnowledgeAnswer(db, input, searcher?)` returns `{ intake, route, evidence, answer, risk }`.
  - API route returns the same five objects that `ResultTabs` already expects.
