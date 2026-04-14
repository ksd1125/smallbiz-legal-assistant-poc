import { NextResponse } from 'next/server';
import { searchLaw } from '@/lib/law/searchLaw';
import type { LegalRouteResult } from '@/types/legalAssistant';

export async function POST(request: Request) {
  try {
    const route = await request.json() as LegalRouteResult;
    const result = await searchLaw(route);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
