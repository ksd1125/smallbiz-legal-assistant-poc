import * as fs from 'node:fs';
import * as path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { KNOWLEDGE_SCHEMA } from './schema';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'legal-knowledge.sqlite');

export function getKnowledgeDbPath() {
  return DB_PATH;
}

export function applyKnowledgeSchema(db: DatabaseSync) {
  db.exec('PRAGMA foreign_keys = ON');
  for (const sql of KNOWLEDGE_SCHEMA) {
    db.exec(sql);
  }
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
