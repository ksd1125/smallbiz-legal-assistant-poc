'use client';

import { useEffect, useState } from 'react';
import { ApiSetupGuide } from '@/components/ApiSetupGuide';
import { GuidedIntake } from '@/components/GuidedIntake';
import { IssueCards } from '@/components/IssueCards';
import { ResultTabs } from '@/components/ResultTabs';
import type {
  AnswerResult,
  ConfigStatus,
  EvidenceResult,
  IntakeInput,
  IntakeResult,
  IssueCardId,
  LegalRouteResult,
  RiskCheckResult
} from '@/types/legalAssistant';

interface KnowledgeAnswerApiResult {
  intake: IntakeResult;
  route: LegalRouteResult;
  evidence: EvidenceResult;
  answer: AnswerResult;
  risk: RiskCheckResult;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error ?? `${url} failed`);
  }

  return response.json() as Promise<T>;
}

export default function Home() {
  const [input, setInput] = useState<IntakeInput>({
    issueCard: 'startup',
    intakeMode: 'guided',
    businessType: '',
    stage: '창업 전',
    stakeholder: '',
    documentStatus: '아직 없음',
    interestIssue: '',
    question: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [intake, setIntake] = useState<IntakeResult>();
  const [route, setRoute] = useState<LegalRouteResult>();
  const [evidence, setEvidence] = useState<EvidenceResult>();
  const [answer, setAnswer] = useState<AnswerResult>();
  const [risk, setRisk] = useState<RiskCheckResult>();
  const [configStatus, setConfigStatus] = useState<ConfigStatus>();

  useEffect(() => {
    fetch('/api/config-status')
      .then((response) => response.json())
      .then((status: ConfigStatus) => setConfigStatus(status))
      .catch(() => setConfigStatus(undefined));
  }, []);

  async function runFlow() {
    setLoading(true);
    setMessage('SQLite 지식베이스에서 관련 법률정보를 찾는 중입니다.');
    try {
      const bundle = await postJson<KnowledgeAnswerApiResult>('/api/knowledge-answer', input);
      setIntake(bundle.intake);
      setRoute(bundle.route);
      setEvidence(bundle.evidence);
      setAnswer(bundle.answer);
      setRisk(bundle.risk);
      setMessage('확인이 끝났습니다.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="heroBand">
        <div>
          <p className="eyebrow">Smallbiz Legal Assistant POC</p>
          <h1>소상공인 법률정보 도우미</h1>
          <p>상황을 고르면 관련 법률정보 후보와 확인 체크리스트를 정리합니다.</p>
        </div>
      </section>

      <section className="workspace">
        <div className="leftPane">
          <h2>상황 선택</h2>
          {input.intakeMode === 'guided' ? (
            <IssueCards selected={input.issueCard} onSelect={(issueCard: IssueCardId) => setInput((current) => ({ ...current, issueCard, interestIssue: '' }))} />
          ) : null}
          <GuidedIntake {...input} loading={loading} onChange={(patch) => setInput((current) => ({ ...current, ...patch }))} onSubmit={runFlow} />
          {message ? <p className="statusLine">{message}</p> : null}
          <details className="developerPanel">
            <summary>개발자용 API 설정</summary>
            <ApiSetupGuide status={configStatus} />
          </details>
        </div>
        <div className="rightPane">
          <ResultTabs intake={intake} route={route} evidence={evidence} answer={answer} risk={risk} />
        </div>
      </section>
    </main>
  );
}
