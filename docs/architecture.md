# 아키텍처

## 목표

사용자가 상황 카드를 선택하고 짧은 문장을 입력하면, Agent API가 상황을 구조화하고 국가법령정보 검색어를 만든 뒤 쉬운 설명과 체크리스트를 제공한다.

## 흐름

```text
page.tsx
→ /api/intake
→ /api/route-legal-issue
→ /api/search-law
→ /api/generate-answer
→ /api/risk-check
→ ResultTabs
```

## 에이전트

| Agent | 파일 | 역할 |
|---|---|---|
| Intake | `src/lib/gemini/agents.ts` | 업종, 단계, 이슈, 빠진 정보 추출 |
| Legal Router | `src/lib/gemini/agents.ts` | 법률 분야와 검색어 생성 |
| Evidence | `src/lib/gemini/agents.ts` | 검색 결과를 근거 목록으로 정리 |
| Answer | `src/lib/gemini/agents.ts` | 쉬운 설명과 체크리스트 작성 |
| Risk Guard | `src/lib/gemini/agents.ts`, `src/lib/safety/legalRiskGuard.ts` | 자문 오해와 개인정보 위험 점검 |

## 환경변수

| 변수 | 목적 | 저장 위치 |
|---|---|---|
| `GEMINI_API_KEY` | Gemini API 호출 | `.env.local` |
| `OPEN_LAW_OC` | 국가법령정보 Open API OC 값 | `.env.local` |

## API 키 보안

API 키는 서버 API Route에서만 사용한다. 브라우저 컴포넌트에서는 키를 읽지 않는다.

## POC 제한

- 국가법령정보 API 호출은 법령 검색 중심으로 시작한다.
- 판례, 법령해석례, 행정심판례는 검색 대상 확장 포인트로 둔다.
- 계약서 원문 저장 기능은 만들지 않는다.
