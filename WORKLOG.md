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
