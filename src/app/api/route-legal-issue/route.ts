import { NextResponse } from 'next/server';
import { runLegalRouterAgent } from '@/lib/gemini/agents';
import { createFallbackRoute, isGeminiQuotaError } from '@/lib/localFallbacks';
import type { IntakeResult } from '@/types/legalAssistant';

export async function POST(request: Request) {
  const intake = await request.json() as IntakeResult;
  try {
    const result = await runLegalRouterAgent(intake);
    return NextResponse.json(result);
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      return NextResponse.json(createFallbackRoute(intake));
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
