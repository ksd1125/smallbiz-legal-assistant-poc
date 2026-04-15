import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface LocalEnvInput {
  geminiApiKey?: string;
  openLawOc?: string;
  legalDataProvider?: string;
  koreanLawMcpUrl?: string;
  lexguardMcpUrl?: string;
  lawApiKey?: string;
}

const allowedProviders = new Set(['openlaw_direct', 'korean_law_mcp', 'lexguard_mcp']);

function cleanValue(value: unknown): string {
  return String(value ?? '').replace(/[\r\n]/g, '').trim();
}

function isLocalRequest(request: Request): boolean {
  const host = request.headers.get('host') ?? '';
  return host.startsWith('localhost:') || host.startsWith('127.0.0.1:') || host === 'localhost' || host === '127.0.0.1';
}

function envLine(name: string, value: string): string {
  return `${name}=${value}`;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development' || !isLocalRequest(request)) {
    return NextResponse.json({ error: 'Local .env saving is only available on localhost during development.' }, { status: 403 });
  }

  const body = await request.json() as LocalEnvInput;
  const provider = cleanValue(body.legalDataProvider || 'openlaw_direct');

  if (!allowedProviders.has(provider)) {
    return NextResponse.json({ error: 'Invalid LEGAL_DATA_PROVIDER.' }, { status: 400 });
  }

  const openLawOc = cleanValue(body.openLawOc || (provider === 'openlaw_direct' ? body.lawApiKey : ''));
  const lawApiKey = cleanValue(body.lawApiKey || openLawOc);
  const lines = [
    envLine('GEMINI_API_KEY', cleanValue(body.geminiApiKey)),
    envLine('OPEN_LAW_OC', openLawOc),
    envLine('LEGAL_DATA_PROVIDER', provider),
    envLine('KOREAN_LAW_MCP_URL', cleanValue(body.koreanLawMcpUrl || 'http://localhost:8096/mcp')),
    envLine('LEXGUARD_MCP_URL', cleanValue(body.lexguardMcpUrl || 'http://localhost:9099/mcp')),
    envLine('LAW_API_KEY', lawApiKey),
    envLine('NEXT_PUBLIC_APP_NAME', '소상공인 법률정보 도우미')
  ];

  await writeFile(path.join(process.cwd(), '.env.local'), `${lines.join('\n')}\n`, 'utf8');

  return NextResponse.json({
    saved: true,
    message: '.env.local saved. Restart the dev server to apply the values.'
  });
}
