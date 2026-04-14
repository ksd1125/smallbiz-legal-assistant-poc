import type { ConfigStatus } from '@/types/legalAssistant';

interface ApiSetupGuideProps {
  status?: ConfigStatus;
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return <span className={active ? 'statusBadge ok' : 'statusBadge warn'}>{label}: {active ? '설정됨' : '미설정'}</span>;
}

export function ApiSetupGuide({ status }: ApiSetupGuideProps) {
  return (
    <section className="setupGuide">
      <h2>API 설정 위치</h2>
      <p>승인받은 국가법령정보 공동활용 API 값은 브라우저가 아니라 서버 환경파일에 입력합니다.</p>
      <div className="statusBadges">
        <StatusBadge active={Boolean(status?.geminiConfigured)} label="Gemini" />
        <StatusBadge active={Boolean(status?.openLawConfigured)} label="국가법령정보 OC" />
        <StatusBadge active={Boolean(status?.lawApiKeyConfigured)} label="MCP LAW_API_KEY" />
      </div>
      <ol>
        <li><code>C:\Users\USER\codex-test\smallbiz-legal-assistant-poc</code> 폴더에서 <code>.env.local</code> 파일을 만듭니다.</li>
        <li>직접 API 방식이면 승인받은 값을 <code>OPEN_LAW_OC</code> 항목에 입력합니다.</li>
        <li><code>korean-law-mcp</code>나 <code>lexguard-mcp</code>를 실행할 때는 MCP 서버의 <code>LAW_API_KEY</code> 항목에 같은 값을 입력합니다.</li>
        <li>입력 후 개발 서버를 다시 시작합니다.</li>
      </ol>
      <pre className="envExample">{`GEMINI_API_KEY=
OPEN_LAW_OC=
LEGAL_DATA_PROVIDER=openlaw_direct
LAW_API_KEY=
`}</pre>
      <p className="privacyNotice">실제 API 값은 GitHub, README, 채팅창에 붙여넣지 마세요.</p>
      {status ? <p className="providerLine">현재 Provider: <code>{status.legalDataProvider}</code></p> : null}
    </section>
  );
}
