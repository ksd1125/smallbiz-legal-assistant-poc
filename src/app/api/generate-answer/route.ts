import { NextResponse } from 'next/server';
import { runAnswerAgent, runEvidenceAgent } from '@/lib/gemini/agents';
import type { IntakeResult, LawSearchResult, LegalRouteResult } from '@/types/legalAssistant';

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      intake: IntakeResult;
      route: LegalRouteResult;
      searchResults: LawSearchResult[];
    };

    const evidence = await runEvidenceAgent(body.route, body.searchResults);
    const answer = await runAnswerAgent(body.intake, body.route, evidence);
    return NextResponse.json({ evidence, answer });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
