import { NextResponse } from 'next/server';
import { runIntakeAgent } from '@/lib/gemini/agents';
import type { IntakeInput } from '@/types/legalAssistant';

export async function POST(request: Request) {
  try {
    const body = await request.json() as IntakeInput;
    const result = await runIntakeAgent(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
