# 작업 로그

## 2026-04-14

### 초기 구성

- 저장소명: `smallbiz-legal-assistant-poc`
- 목적: 소상공인과 예비창업자를 위한 법률정보 도우미 POC
- 기준 설계: `codex-guide/projects/smallbiz-legal-assistant/outputs`의 Agent API POC 설계 문서

### 생성한 구조

- `README.md`: 프로젝트 설명과 실행 방법
- `AGENTS.md`: Codex 작업 지침
- `docs/AI_SEARCH_INDEX.md`: GitHub/Codex 검색용 색인
- `docs/architecture.md`: Agent API 아키텍처
- `docs/source-policy.md`: 공식 출처와 보안 정책
- `src/app`: Next.js 화면과 API Routes
- `src/lib/gemini`: Gemini 호출과 역할별 에이전트
- `src/lib/law`: 국가법령정보 검색 클라이언트
- `src/lib/safety`: 법률 자문 오해 방지 점검

### 다음 작업

1. GitHub에서 `smallbiz-legal-assistant-poc` 빈 저장소를 만든다.
2. 이 로컬 저장소의 `origin`을 GitHub 저장소로 연결한다.
3. `npm install` 후 `npm run typecheck`를 실행한다.
4. Gemini API와 국가법령정보 Open API 환경변수를 `.env.local`에 설정한다.
5. 카드형 입력에서 `/api/intake` 호출이 되는지 확인한다.

### 검증 기록

- `npm install` 실행 후 `next@14.2.5` 보안 경고가 확인되어 `next@16.2.3`으로 업데이트했다.
- `npm.cmd audit --audit-level=low`: 취약점 0개.
- `npm.cmd run typecheck`: TypeScript 검증 통과.
- `git ls-remote https://github.com/ksd1125/smallbiz-legal-assistant-poc.git`: GitHub 원격 저장소가 아직 없어 `Repository not found`가 반환됐다.

### MCP 연동 정리

- `korean-law-mcp`는 국가법령정보센터 Open API를 활용하는 MCP 서버로 확인했다.
- 현재 POC는 국가법령정보 Open API 직접 호출 방식이며, MCP는 2단계 adapter로 붙이는 방향으로 정리했다.
- `docs/mcp-integration.md`를 추가해 직접 API 방식과 MCP 경유 방식의 차이를 기록했다.

### API 입력 위치 기능

- 화면에 `API 설정 위치` 패널을 추가했다.
- `/api/config-status`에서 `GEMINI_API_KEY`, `OPEN_LAW_OC`, `LAW_API_KEY`의 설정 여부만 반환하도록 했다.
- 실제 API 키 값은 화면에 표시하지 않는다.
- `복사` 버튼과 로컬 개발환경 전용 `.env.local` 저장 API를 추가했다.

### GitHub Pages 정적 POC

- `docs/index.html`, `docs/styles.css`, `docs/app.js`로 서버 없이 열 수 있는 정적 POC 화면을 추가했다.
- GitHub Pages에서 API 키를 저장하지 않고 현재 브라우저 세션 입력값만 사용하도록 안내했다.
- 정적 화면의 사용자 입력값이 HTML로 실행되지 않도록 `tests/static-docs-security.test.js` 검증을 추가했다.

### 오픈형/상황 카드형 UI와 korean-law-mcp adapter

- React POC 화면에 `상황에서 고르기`와 `그냥 질문하기` 시작 방식을 추가했다.
- 상황 카드별 자주 묻는 이슈 버튼과 관련 법률 후보 안내를 `src/lib/issueCatalog.ts`로 분리했다.
- 입력 항목에 상대방/관계자, 날짜가 있는 문서 여부, 관심 이슈를 추가했다.
- 결과 영역을 `요약`, `공식 근거`, `체크리스트`, `상담 준비`, `HWP/Excel 복사용` 구조로 확장했다.
- `LEGAL_DATA_PROVIDER=korean_law_mcp`일 때 `SeoNaRu/korean-law-mcp`의 MCP tool 호출을 시도하는 `src/lib/law/koreanLawMcpClient.ts` adapter를 추가했다.
- `tests/issue-catalog.test.js`로 상황 카드별 FAQ/관련 법률 후보 데이터 검증을 추가했다.
- GitHub Pages 배포용 `docs` 정적 화면에도 오픈형/상황 카드형 UX와 HWP/Excel 복사용 결과를 반영했다.
- GitHub Pages 정적 자산은 `docs\index.html`, `docs\css\styles.css`, `docs\js\app.js` 구조로 정리했다.
- GitHub Pages는 별도 Actions 워크플로가 아니라 `Deploy from a branch → main → /docs` 방식으로 운영한다.

### API 키/OC 입력과 버튼 무반응 원인 수정

- `.env.local`에 `OPEN_LAW_OC`가 비어 있고 `LAW_API_KEY`에만 값이 있을 때 직접 Open Law 검색에서 OC가 전달되지 않는 문제를 확인했다.
- `openlaw_direct` 방식에서도 `OPEN_LAW_OC`가 없으면 `LAW_API_KEY`를 OC fallback으로 사용하도록 수정했다.
- API 설정 저장 시 직접 검색 방식에서 `OPEN_LAW_OC`가 비어 있고 `LAW_API_KEY`만 입력된 경우 `OPEN_LAW_OC`에도 같은 값을 저장하도록 보강했다.
- 질문 입력칸이 비어 있으면 `법률정보 후보 찾기` 버튼이 비활성화되어 상황 카드만 선택한 사용자가 무반응처럼 느끼는 문제를 수정했다.
- `tests/open-law-env.test.js`, `tests/guided-intake-submit.test.js`를 추가했다.
- `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build` 검증을 통과했다.

### 실제 API 연결 테스트와 Gemini 응답 보강

- 사용자가 로컬 `.env.local`에 API 값을 입력한 뒤 설정 여부를 값 노출 없이 확인했다.
- `/api/config-status`에서 Gemini, 국가법령정보 OC, LAW_API_KEY가 모두 설정됨으로 확인됐다.
- `/api/search-law`에서 국가법령정보 Open API 응답을 확인했다.
- `/api/intake`에서 Gemini 호출은 성공했으나, 일부 Gemini JSON 응답이 중간에서 잘려 파싱 실패하는 현상을 확인했다.
- Gemini 구조화 JSON 응답이 깨진 경우 한 번 재시도하고, 재시도 시 출력 토큰 한도를 늘리도록 보강했다.
- Gemini 429/5xx 일시 오류는 한 번 재시도하도록 보강했다.
- 이후 전체 흐름 재검증 중 Gemini `429 Too Many Requests`가 반환되어 추가 실사용 호출은 중단했다.
