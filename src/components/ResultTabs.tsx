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

  const copySummary = [
    '[요약]',
    risk?.final_answer_markdown ?? answer?.summary ?? '답변 생성 전입니다.',
    '',
    '[관련 분야]',
    ...(route?.legal_domains ?? answer?.related_domains ?? []),
    '',
    '[체크리스트]',
    ...(answer?.checklist ?? intake?.next_questions ?? []),
    '',
    '[상담 준비 질문]',
    ...(answer?.next_questions ?? intake?.next_questions ?? []),
    '',
    '[주의]',
    ...(answer?.cautions ?? ['법률정보 탐색을 돕기 위한 참고자료이며, 개별 사건에 대한 법률 자문은 아닙니다.'])
  ].join('\n');

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
          <h2>공식 근거</h2>
          <SourceList evidence={evidence} />
        </article>
        <article>
          <h2>체크리스트</h2>
          <ul>
            {(answer?.checklist ?? intake?.next_questions ?? []).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article>
          <h2>상담 준비</h2>
          <ul>
            {(answer?.next_questions ?? intake?.next_questions ?? []).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="copyArticle">
          <h2>HWP/Excel 복사용</h2>
          <pre className="copyBox">{copySummary}</pre>
        </article>
      </div>
    </section>
  );
}
