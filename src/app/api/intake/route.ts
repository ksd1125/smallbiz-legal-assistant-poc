import { NextResponse } from 'next/server';
import { runIntakeAgent } from '@/lib/gemini/agents';
import { createFallbackIntake, isGeminiQuotaError } from '@/lib/localFallbacks';
import type { IntakeInput } from '@/types/legalAssistant';

export async function POST(request: Request) {
  const body = await request.json() as IntakeInput;
  try {
    const result = await runIntakeAgent(body);
    return NextResponse.json(result);
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      return NextResponse.json(createFallbackIntake(body));
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
