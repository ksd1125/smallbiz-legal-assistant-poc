import { NextResponse } from 'next/server';
import type { ConfigStatus } from '@/types/legalAssistant';

export async function GET() {
  const openLawConfigured = Boolean(process.env.OPEN_LAW_OC || process.env.LAW_API_KEY);
  const status: ConfigStatus = {
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    openLawConfigured,
    lawApiKeyConfigured: Boolean(process.env.LAW_API_KEY),
    legalDataProvider: process.env.LEGAL_DATA_PROVIDER ?? 'openlaw_direct',
    koreanLawMcpUrl: process.env.KOREAN_LAW_MCP_URL ?? 'http://localhost:8096/mcp',
    lexguardMcpUrl: process.env.LEXGUARD_MCP_URL ?? 'http://localhost:9099/mcp'
  };

  return NextResponse.json(status);
}
