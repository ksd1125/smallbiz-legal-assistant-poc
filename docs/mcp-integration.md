# 국가법령정보 MCP 연동 방식

## 결론

맞다. `korean-law-mcp`는 국가법령정보센터 Open API를 활용하는 MCP 서버이므로, 법률 데이터의 원천은 국가법령정보 공동활용 API가 되어야 한다.

다만 현재 POC에는 두 가지 선택지가 있다.

| 방식 | 데이터 흐름 | 장점 | 단점 |
|---|---|---|---|
| 직접 API | Next.js API Route → 국가법령정보 Open API | 구조가 단순하고 POC 구현이 빠름 | MCP tool 재사용성이 낮음 |
| MCP 경유 | Next.js API Route → korean-law-mcp 또는 lexguard-mcp → 국가법령정보 Open API | MCP tool, 캐싱, 조문/판례 도구 구조를 재사용 | MCP 서버 실행과 연결 설정이 추가됨 |

## 현재 확인한 저장소 상태

- `SeoNaRu/korean-law-mcp`: README 기준 국가법령정보센터 Open API를 활용한 MCP 서버다. 법령 검색, 법령 상세 조회, 판례 검색, 판례 상세 조회, 행정규칙 검색 도구를 제공한다.
- 2026-04-14 확인 기준 `SeoNaRu/korean-law-mcp`는 GitHub 공개 저장소이며 stars 61, forks 17, commits 4개로 확인됐다. README 기준 `LAW_API_KEY`, 기본 포트 `8096`, `python -m src.law_main` 실행 방식을 사용한다.
- `SeoNaRu/lexguard-mcp`: README 기준 국가법령정보센터(Open Law) 공식 데이터를 기반으로 법령, 조문, 판례, 법령해석, 행정심판, 헌재결정을 제공하는 MCP 서버다.

## 권장 방향

POC는 직접 API와 `korean-law-mcp` adapter를 모두 둔다. 화면과 Agent API 흐름 검증은 직접 API로 빠르게 진행할 수 있고, 실제 법률 검색 확장은 `LEGAL_DATA_PROVIDER=korean_law_mcp`로 전환해 확인한다.

```text
src/lib/law/searchLaw.ts
→ LEGAL_DATA_PROVIDER 값 확인
→ openlaw_direct이면 openLawClient.ts 호출
→ korean_law_mcp이면 koreanLawMcpClient.ts에서 search_law_tool, search_precedent_tool, search_administrative_rule_tool 호출 시도
→ lexguard_mcp이면 lexguardMcpClient.ts 호출
```

## 환경변수

```text
LEGAL_DATA_PROVIDER=openlaw_direct
OPEN_LAW_OC=
KOREAN_LAW_MCP_URL=http://localhost:8096/mcp
LEXGUARD_MCP_URL=http://localhost:9099/mcp
LAW_API_KEY=
```

주의:

- `OPEN_LAW_OC`는 이 Next.js 앱이 국가법령정보 Open API를 직접 호출할 때 사용한다.
- `LAW_API_KEY`는 `korean-law-mcp` 또는 `lexguard-mcp` 서버를 실행할 때 쓰는 국가법령정보 API 키 이름이다.
- 실제 키 값은 `.env.local` 또는 MCP 서버의 `.env`에만 넣고 GitHub에 올리지 않는다.

## 다음 구현 과제

1. `src/lib/law/koreanLawMcpClient.ts` 추가
2. `src/lib/law/lexguardMcpClient.ts` 추가
3. `src/lib/law/searchLaw.ts`에서 `LEGAL_DATA_PROVIDER`에 따라 직접 API/MCP를 선택
4. MCP 서버 실행 여부를 확인하는 `/api/law-health` 추가
5. 공공기관 환경에서는 원격 MCP보다 로컬 또는 기관 내부 MCP 실행을 우선 검토

## 참고 출처

- korean-law-mcp: https://github.com/SeoNaRu/korean-law-mcp
- lexguard-mcp: https://github.com/SeoNaRu/lexguard-mcp
- 국가법령정보 공동활용: https://open.law.go.kr/LSO/openApi/guideList.do
