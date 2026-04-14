# AI Search Index

이 문서는 GitHub 검색과 Codex 재탐색을 위한 색인이다.

## 검색 키워드

`소상공인 법률정보 도우미`, `법률 도우미`, `smallbiz legal assistant`, `Gemini Agent API`, `Agent API`, `국가법령정보`, `Open Law API`, `법제처`, `상가건물 임대차보호법`, `근로기준법`, `식품위생법`, `전자상거래법`, `계약서`, `행정처분`, `과태료`, `내용증명`, `미수금`, `소액사건`, `행정심판`, `lexguard-mcp`, `korean-law-mcp`.

## 파일 지도

| 파일 | 검색 목적 |
|---|---|
| `README.md` | 프로젝트 전체 설명, 실행 방법, GitHub 업로드 방법 |
| `AGENTS.md` | Codex가 새 세션에서 따라야 할 작업 지침 |
| `WORKLOG.md` | 최근 작업, 다음 작업, 세션 연속성 |
| `docs/architecture.md` | Agent API, Gemini 역할, 데이터 흐름 |
| `docs/mcp-integration.md` | korean-law-mcp, lexguard-mcp, 국가법령정보 Open API 관계 |
| `docs/source-policy.md` | 공식 출처, 개인정보, 법률정보 고지 |
| `docs/index.html` | GitHub Pages용 정적 POC 화면 |
| `docs/js/app.js` | 정적 POC 카드 입력, 검색 링크, API 설정 복사 |
| `docs/css/styles.css` | 정적 POC 화면 스타일 |
| `.github/workflows/pages.yml` | GitHub Pages 배포 워크플로 |
| `tests/static-docs-security.test.js` | 정적 POC 입력값 이스케이프 검증 |
| `src/app/page.tsx` | 카드형 입력과 결과 탭 UI |
| `src/lib/issueCatalog.ts` | 상황 카드, 자주 묻는 이슈, 관련 법률 후보 |
| `src/app/api/config-status/route.ts` | API 키 환경변수 설정 여부 확인 |
| `src/app/api/local-env/route.ts` | 로컬 개발환경 전용 `.env.local` 저장 |
| `src/app/api/intake/route.ts` | Intake Agent API |
| `src/app/api/route-legal-issue/route.ts` | 법률 분야 분류 API |
| `src/app/api/search-law/route.ts` | 국가법령정보 검색 API |
| `src/app/api/generate-answer/route.ts` | 쉬운 설명과 체크리스트 생성 API |
| `src/app/api/risk-check/route.ts` | 법률 자문 오해 방지 API |
| `src/lib/gemini/agents.ts` | Gemini 역할별 에이전트 프롬프트 |
| `src/lib/gemini/client.ts` | Gemini REST API 공통 호출 |
| `src/lib/gemini/schemas.ts` | Structured Output 스키마 |
| `src/lib/law/openLawClient.ts` | 국가법령정보 Open API 클라이언트 |
| `src/lib/law/koreanLawMcpClient.ts` | SeoNaRu/korean-law-mcp adapter 초안 |
| `src/lib/law/searchLaw.ts` | 법령, 판례, 법령해석례 검색 래퍼 |
| `src/lib/safety/legalRiskGuard.ts` | 금지 표현과 안전 고지문 |
| `src/components/ApiSetupGuide.tsx` | 국가법령정보 API 입력 위치 안내, 복사, 로컬 저장 |
| `src/types/legalAssistant.ts` | 공통 TypeScript 타입 |

## Codex가 빠르게 찾을 질문

- "Intake Agent는 어디에 있나?" → `src/lib/gemini/agents.ts`, `src/app/api/intake/route.ts`
- "국가법령정보 API는 어디서 호출하나?" → `src/lib/law/openLawClient.ts`
- "API 키는 어디에 입력하나?" → `src/components/ApiSetupGuide.tsx`, `src/app/api/config-status/route.ts`
- "MCP를 쓰려면 어디를 보나?" → `docs/mcp-integration.md`
- "korean-law-mcp adapter는 어디에 있나?" → `src/lib/law/koreanLawMcpClient.ts`, `src/lib/law/searchLaw.ts`
- "법률 자문 오해 방지는 어디서 하나?" → `src/lib/safety/legalRiskGuard.ts`, `src/app/api/risk-check/route.ts`
- "화면 카드는 어디서 바꾸나?" → `src/components/IssueCards.tsx`
- "GitHub Pages 화면은 어디서 바꾸나?" → `docs/index.html`, `docs/styles.css`, `docs/app.js`
- "새 작업 시작 시 무엇을 읽나?" → `WORKLOG.md`, `AGENTS.md`
