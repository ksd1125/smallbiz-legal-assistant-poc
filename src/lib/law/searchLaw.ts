import type { LawSearchResult, LegalRouteResult } from '@/types/legalAssistant';
import { searchOpenLaw } from './openLawClient';

export async function searchLaw(route: LegalRouteResult): Promise<LawSearchResult[]> {
  const results: LawSearchResult[] = [];

  for (const query of route.search_queries.slice(0, 5)) {
    if (query.source === 'open_law') {
      const items = await searchOpenLaw(query);
      results.push(...items);
    }
  }

  return results;
}
