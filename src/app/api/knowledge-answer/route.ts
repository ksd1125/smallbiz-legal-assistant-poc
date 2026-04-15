import { NextResponse } from 'next/server';
import { buildKnowledgeAnswer } from '@/lib/kb/buildKnowledgeAnswer';
import { openKnowledgeDb } from '@/lib/kb/db';
import { seedKnowledgeBase } from '@/lib/kb/initKnowledgeBase';
import type { IntakeInput } from '@/types/legalAssistant';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as IntakeInput;
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
