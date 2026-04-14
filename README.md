# 소상공인 법률정보 도우미 POC

소상공인과 예비창업자가 법률 질문을 정확히 쓰지 못해도, 카드형 입력과 Agent API 흐름으로 관련 법령, 판례, 법령해석례 후보를 찾고 쉬운 체크리스트로 정리하는 웹 POC다.

검색 키워드: `소상공인`, `법률정보`, `법률 도우미`, `smallbiz legal assistant`, `Gemini Agent API`, `국가법령정보`, `Open Law API`, `lexguard-mcp`, `korean-law-mcp`, `창업`, `상가 임대차`, `근로계약`, `계약서`, `행정처분`, `미수금`, `내용증명`.

## 현재 범위

- 카드형 상황 선택 UI
- Gemini 기반 역할별 Agent API 초안
- 국가법령정보 Open API 검색 클라이언트 초안
- `korean-law-mcp` 또는 `lexguard-mcp` 연동을 위한 MCP 설계 문서
- API 설정 위치와 서버 인식 여부를 보여주는 설정 안내 패널
- 법률 자문 오해 방지용 Risk Guard
- GitHub/Codex 검색용 문서 인덱스

## 실행 방법

PowerShell에서 이 폴더로 이동한다.

```powershell
cd C:\Users\USER\codex-test\smallbiz-legal-assistant-poc
npm install
Copy-Item .env.example .env.local
notepad .env.local
npm run dev
```

`.env.local`에는 실제 키를 넣되 GitHub에 올리지 않는다.

```text
GEMINI_API_KEY=
OPEN_LAW_OC=
LEGAL_DATA_PROVIDER=openlaw_direct
KOREAN_LAW_MCP_URL=http://localhost:8096/mcp
LEXGUARD_MCP_URL=http://localhost:9099/mcp
LAW_API_KEY=
```

웹 화면의 `API 설정 위치` 패널에서 `OPEN_LAW_OC`, `LAW_API_KEY`가 서버에 설정되었는지 확인할 수 있다. 패널은 값 자체를 보여주지 않고 설정 여부만 표시한다.

로컬 개발 서버에서만 `API 설정 위치` 패널의 `복사`와 `로컬 .env.local 저장` 버튼을 사용할 수 있다. 배포 환경에서는 서버 파일 저장 API가 차단된다.

브라우저에서 `http://localhost:3000`을 연다.

## GitHub 업로드

신규 GitHub 저장소 이름 권장값:

```text
smallbiz-legal-assistant-poc
```

저장소를 만든 뒤 아래 명령을 실행한다.

```powershell
cd C:\Users\USER\codex-test\smallbiz-legal-assistant-poc
git remote add origin https://github.com/ksd1125/smallbiz-legal-assistant-poc.git
git push -u origin main
```

## 문서 위치

- `AGENTS.md`: Codex 작업 지침
- `WORKLOG.md`: 작업 이력과 다음 작업
- `docs/AI_SEARCH_INDEX.md`: Codex/GitHub 검색용 색인
- `docs/architecture.md`: Agent API 아키텍처
- `docs/mcp-integration.md`: 국가법령정보 MCP 연동 방식
- `docs/source-policy.md`: 출처와 보안 정책

## 보안 원칙

API 키, 토큰, 개인정보, 고객정보, 계약서 원문, 기관 내부 URL은 코드와 문서에 저장하지 않는다. POC 단계에서는 계약서 원문 업로드보다 일부 조항 요약 입력만 허용한다.

## 법률정보 고지

이 POC는 법률정보 탐색을 돕는 도구다. 개별 사건에 대한 법률 자문, 승소 가능성 판단, 소송 전략, 계약 해지 지시는 제공하지 않는다.
