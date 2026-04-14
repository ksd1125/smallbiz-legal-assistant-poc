'use client';

import { useState } from 'react';
import { GuidedIntake } from '@/components/GuidedIntake';
import { IssueCards } from '@/components/IssueCards';
import { ResultTabs } from '@/components/ResultTabs';
import type {
  AnswerResult,
  EvidenceResult,
  IntakeInput,
  IntakeResult,
  IssueCardId,
  LawSearchResult,
  LegalRouteResult,
  RiskCheckResult
} from '@/types/legalAssistant';

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
  const [input, setInput] = useState<IntakeInput>({ issueCard: 'startup', businessType: '', stage: '창업 전', question: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [intake, setIntake] = useState<IntakeResult>();
  const [route, setRoute] = useState<LegalRouteResult>();
  const [evidence, setEvidence] = useState<EvidenceResult>();
  const [answer, setAnswer] = useState<AnswerResult>();
  const [risk, setRisk] = useState<RiskCheckResult>();

  async function runFlow() {
    setLoading(true);
    setMessage('상황을 구조화하는 중입니다.');
    try {
      const intakeResult = await postJson<IntakeResult>('/api/intake', input);
      setIntake(intakeResult);

      setMessage('관련 법률 분야와 검색어를 만드는 중입니다.');
      const routeResult = await postJson<LegalRouteResult>('/api/route-legal-issue', intakeResult);
      setRoute(routeResult);

      setMessage('국가법령정보 검색 후보를 확인하는 중입니다.');
      const searchResults = await postJson<LawSearchResult[]>('/api/search-law', routeResult);

      setMessage('쉬운 설명과 체크리스트를 작성하는 중입니다.');
      const answerBundle = await postJson<{ evidence: EvidenceResult; answer: AnswerResult }>('/api/generate-answer', {
        intake: intakeResult,
        route: routeResult,
        searchResults
      });
      setEvidence(answerBundle.evidence);
      setAnswer(answerBundle.answer);

      setMessage('법률 자문 오해 표현을 점검하는 중입니다.');
      const riskResult = await postJson<RiskCheckResult>('/api/risk-check', answerBundle.answer);
      setRisk(riskResult);
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
          <IssueCards selected={input.issueCard} onSelect={(issueCard: IssueCardId) => setInput((current) => ({ ...current, issueCard }))} />
          <GuidedIntake {...input} loading={loading} onChange={(patch) => setInput((current) => ({ ...current, ...patch }))} onSubmit={runFlow} />
          {message ? <p className="statusLine">{message}</p> : null}
        </div>
        <div className="rightPane">
          <ResultTabs intake={intake} route={route} evidence={evidence} answer={answer} risk={risk} />
        </div>
      </section>
    </main>
  );
}
