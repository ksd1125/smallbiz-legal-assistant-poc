import type { LawSearchResult, LegalRouteResult } from '@/types/legalAssistant';

interface McpToolCallResult {
  content?: Array<{ type?: string; text?: string }>;
  result?: unknown;
  error?: unknown;
}

const MCP_TOOL_BY_TARGET: Record<LegalRouteResult['search_queries'][number]['target'], string> = {
  law: 'search_law_tool',
  prec: 'search_precedent_tool',
  expc: 'search_law_tool',
  decc: 'search_administrative_rule_tool'
};

export async function searchKoreanLawMcp(query: LegalRouteResult['search_queries'][number]): Promise<LawSearchResult[]> {
  const baseUrl = process.env.KOREAN_LAW_MCP_URL ?? 'http://localhost:8096/mcp';
  const toolName = MCP_TOOL_BY_TARGET[query.target];

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `smallbiz-${Date.now()}`,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: {
            query: query.query,
            page: 1,
            page_size: 5
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`korean-law-mcp HTTP ${response.status}`);
    }

    const payload = await response.json() as McpToolCallResult;
    return normalizeMcpResult(query, toolName, payload);
  } catch (error) {
    return [{
      source: 'korean-law-mcp',
      type: query.target,
      title: query.query,
      summary: `korean-law-mcp 연결을 시도했지만 실패했습니다. MCP 서버가 실행 중인지, KOREAN_LAW_MCP_URL=${baseUrl} 설정이 맞는지 확인하세요. 오류: ${error instanceof Error ? error.message : 'Unknown error'}`
    }];
  }
}

function normalizeMcpResult(
  query: LegalRouteResult['search_queries'][number],
  toolName: string,
  payload: McpToolCallResult
): LawSearchResult[] {
  const text = payload.content?.map((item) => item.text).filter(Boolean).join('\n') ?? JSON.stringify(payload.result ?? payload);

  return [{
    source: 'korean-law-mcp',
    type: query.target,
    title: `${toolName}: ${query.query}`,
    summary: text.slice(0, 1200),
    raw: payload
  }];
}
