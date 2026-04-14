import { NextResponse } from 'next/server';
import { runRiskGuardAgent } from '@/lib/gemini/agents';
import { appendLegalNotice, findLocalRiskPhrases } from '@/lib/safety/legalRiskGuard';
import type { AnswerResult } from '@/types/legalAssistant';

export async function POST(request: Request) {
  try {
    const answer = await request.json() as AnswerResult;
    const localBlocked = findLocalRiskPhrases(answer.answer_markdown);
    const result = await runRiskGuardAgent({
      ...answer,
      answer_markdown: appendLegalNotice(answer.answer_markdown)
    });

    return NextResponse.json({
      ...result,
      blocked_phrases: Array.from(new Set([...localBlocked, ...result.blocked_phrases]))
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
