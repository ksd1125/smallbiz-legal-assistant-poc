import { NextResponse } from 'next/server';
import { runLegalRouterAgent } from '@/lib/gemini/agents';
import type { IntakeResult } from '@/types/legalAssistant';

export async function POST(request: Request) {
  try {
    const intake = await request.json() as IntakeResult;
    const result = await runLegalRouterAgent(intake);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
