import { NextResponse } from 'next/server';
import { runAnswerAgent, runEvidenceAgent } from '@/lib/gemini/agents';
import { createFallbackAnswer, createFallbackEvidence, isGeminiQuotaError } from '@/lib/localFallbacks';
import type { IntakeResult, LawSearchResult, LegalRouteResult } from '@/types/legalAssistant';

export async function POST(request: Request) {
  const body = await request.json() as {
    intake: IntakeResult;
    route: LegalRouteResult;
    searchResults: LawSearchResult[];
  };
  try {
    const evidence = await runEvidenceAgent(body.route, body.searchResults);
    const answer = await runAnswerAgent(body.intake, body.route, evidence);
    return NextResponse.json({ evidence, answer });
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      const evidence = createFallbackEvidence(body.route, body.searchResults);
      const answer = createFallbackAnswer(body.intake, body.route, evidence);
      return NextResponse.json({ evidence, answer });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
