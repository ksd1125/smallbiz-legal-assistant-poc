'use client';

import { useMemo, useState } from 'react';
import type { ConfigStatus } from '@/types/legalAssistant';

interface ApiSetupGuideProps {
  status?: ConfigStatus;
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return <span className={active ? 'statusBadge ok' : 'statusBadge warn'}>{label}: {active ? '설정됨' : '미설정'}</span>;
}

function envLine(name: string, value: string): string {
  return `${name}=${value}`;
}

export function ApiSetupGuide({ status }: ApiSetupGuideProps) {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openLawOc, setOpenLawOc] = useState('');
  const [lawApiKey, setLawApiKey] = useState('');
  const [legalDataProvider, setLegalDataProvider] = useState('openlaw_direct');
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const envTemplate = useMemo(() => [
    envLine('GEMINI_API_KEY', geminiApiKey),
    envLine('OPEN_LAW_OC', openLawOc),
    envLine('LEGAL_DATA_PROVIDER', legalDataProvider),
    'KOREAN_LAW_MCP_URL=http://localhost:8096/mcp',
    'LEXGUARD_MCP_URL=http://localhost:9099/mcp',
    envLine('LAW_API_KEY', lawApiKey || openLawOc),
    'NEXT_PUBLIC_APP_NAME=소상공인 법률정보 도우미'
  ].join('\n'), [geminiApiKey, lawApiKey, legalDataProvider, openLawOc]);

  async function copyEnvTemplate() {
    await navigator.clipboard.writeText(envTemplate);
    setSaveMessage('.env.local에 붙여넣을 내용을 복사했습니다.');
  }

  async function saveLocalEnv() {
    setSaving(true);
    setSaveMessage('저장 중입니다.');
    try {
      const response = await fetch('/api/local-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiApiKey,
          openLawOc,
          lawApiKey,
          legalDataProvider,
          koreanLawMcpUrl: 'http://localhost:8096/mcp',
          lexguardMcpUrl: 'http://localhost:9099/mcp'
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? '저장에 실패했습니다.');
      }
      setGeminiApiKey('');
      setOpenLawOc('');
      setLawApiKey('');
      setSaveMessage('.env.local에 저장했습니다. 개발 서버를 다시 시작하면 적용됩니다.');
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

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
      <div className="apiSaveForm">
        <label>
          Gemini API Key
          <input type="password" value={geminiApiKey} onChange={(event) => setGeminiApiKey(event.target.value)} placeholder="Gemini API 키" />
        </label>
        <label>
          국가법령정보 OC
          <input type="password" value={openLawOc} onChange={(event) => setOpenLawOc(event.target.value)} placeholder="승인받은 OC 값" />
        </label>
        <label>
          MCP LAW_API_KEY
          <input type="password" value={lawApiKey} onChange={(event) => setLawApiKey(event.target.value)} placeholder="비워두면 OC 값을 같이 사용" />
        </label>
        <label>
          데이터 연결 방식
          <select value={legalDataProvider} onChange={(event) => setLegalDataProvider(event.target.value)}>
            <option value="openlaw_direct">국가법령정보 Open API 직접 호출</option>
            <option value="korean_law_mcp">korean-law-mcp 경유</option>
            <option value="lexguard_mcp">lexguard-mcp 경유</option>
          </select>
        </label>
        <div className="buttonRow">
          <button type="button" className="secondaryButton" onClick={copyEnvTemplate}>복사</button>
          <button type="button" className="primaryButton" onClick={saveLocalEnv} disabled={saving}>{saving ? '저장 중' : '로컬 .env.local 저장'}</button>
        </div>
        {saveMessage ? <p className="providerLine">{saveMessage}</p> : null}
      </div>
      <p className="privacyNotice">실제 API 값은 GitHub, README, 채팅창에 붙여넣지 마세요.</p>
      {status ? <p className="providerLine">현재 Provider: <code>{status.legalDataProvider}</code></p> : null}
    </section>
  );
}
