import type { LawSearchResult, LegalRouteResult } from '@/types/legalAssistant';

const OPEN_LAW_BASE_URL = 'https://www.law.go.kr/DRF/lawSearch.do';

export async function searchOpenLaw(query: LegalRouteResult['search_queries'][number]): Promise<LawSearchResult[]> {
  const oc = (process.env.OPEN_LAW_OC || process.env.LAW_API_KEY || '').trim();
  if (!oc) {
    return [{
      source: '국가법령정보',
      type: query.target,
      title: query.query,
      summary: 'OPEN_LAW_OC 환경변수가 없어 실제 검색을 실행하지 않았습니다. 검색어 후보만 반환합니다.'
    }];
  }

  const params = new URLSearchParams({
    OC: oc,
    target: query.target,
    type: 'JSON',
    query: query.query
  });

  const response = await fetch(`${OPEN_LAW_BASE_URL}?${params.toString()}`, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Open Law API error: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  return normalizeOpenLawResults(query, raw);
}

function normalizeOpenLawResults(
  query: LegalRouteResult['search_queries'][number],
  raw: unknown
): LawSearchResult[] {
  const lawSearch = (raw as { LawSearch?: { law?: unknown[] } }).LawSearch;
  const items = Array.isArray(lawSearch?.law) ? lawSearch.law : [];

  if (items.length === 0) {
    return [{
      source: '국가법령정보',
      type: query.target,
      title: query.query,
      summary: '검색 결과가 없거나 응답 구조가 예상과 다릅니다.',
      raw
    }];
  }

  return items.slice(0, 5).map((item) => {
    const record = item as Record<string, unknown>;
    const title = String(record.법령명한글 ?? record.판례명 ?? record.사건명 ?? query.query);
    return {
      source: '국가법령정보',
      type: query.target,
      title,
      summary: String(record.소관부처명 ?? record.선고일자 ?? record.법령구분명 ?? '공식 검색 결과 후보'),
      url: typeof record.법령상세링크 === 'string' ? `https://www.law.go.kr${record.법령상세링크}` : undefined,
      raw: record
    };
  });
}
