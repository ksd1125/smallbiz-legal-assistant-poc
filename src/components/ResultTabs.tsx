import type { AnswerResult, EvidenceResult, IntakeResult, LegalRouteResult, RiskCheckResult } from '@/types/legalAssistant';
import { SourceList } from './SourceList';

interface ResultTabsProps {
  intake?: IntakeResult;
  route?: LegalRouteResult;
  evidence?: EvidenceResult;
  answer?: AnswerResult;
  risk?: RiskCheckResult;
}

export function ResultTabs({ intake, route, evidence, answer, risk }: ResultTabsProps) {
  if (!intake && !route && !answer) {
    return <section className="resultPanel"><p>상황을 입력하면 결과가 여기에 표시됩니다.</p></section>;
  }

  return (
    <section className="resultPanel">
      <div className="resultColumns">
        <article>
          <h2>요약</h2>
          <p>{risk?.final_answer_markdown ?? answer?.summary ?? '답변 생성 전입니다.'}</p>
          {route ? (
            <ul>
              {route.legal_domains.map((domain) => <li key={domain}>{domain}</li>)}
            </ul>
          ) : null}
        </article>
        <article>
          <h2>근거</h2>
          <SourceList evidence={evidence} />
        </article>
        <article>
          <h2>체크리스트</h2>
          <ul>
            {(answer?.checklist ?? intake?.next_questions ?? []).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </div>
    </section>
  );
}
