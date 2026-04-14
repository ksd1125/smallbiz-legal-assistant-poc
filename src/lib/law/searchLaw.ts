import type { LawSearchResult, LegalRouteResult } from '@/types/legalAssistant';
import { searchKoreanLawMcp } from './koreanLawMcpClient';
import { searchOpenLaw } from './openLawClient';

export async function searchLaw(route: LegalRouteResult): Promise<LawSearchResult[]> {
  const results: LawSearchResult[] = [];
  const provider = process.env.LEGAL_DATA_PROVIDER ?? 'openlaw_direct';

  for (const query of route.search_queries.slice(0, 5)) {
    if (query.source === 'open_law' && provider === 'korean_law_mcp') {
      const items = await searchKoreanLawMcp(query);
      results.push(...items);
    } else if (query.source === 'open_law') {
      const items = await searchOpenLaw(query);
      results.push(...items);
    }
  }

  return results;
}
