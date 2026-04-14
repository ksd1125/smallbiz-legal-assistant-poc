import type { EvidenceResult } from '@/types/legalAssistant';

interface SourceListProps {
  evidence?: EvidenceResult;
}

export function SourceList({ evidence }: SourceListProps) {
  if (!evidence) {
    return <p>공식 출처 후보가 아직 없습니다.</p>;
  }

  return (
    <div className="sourceList">
      {evidence.evidence_items.map((item, index) => (
        <article className="sourceItem" key={`${item.title}-${index}`}>
          <strong>{item.title}</strong>
          <span>{item.source} · {item.type}</span>
          <p>{item.summary}</p>
          {item.url ? <a href={item.url} target="_blank" rel="noreferrer">공식 출처 열기</a> : null}
        </article>
      ))}
      {evidence.evidence_gap.length > 0 ? (
        <div className="gapBox">
          <strong>추가 확인 필요</strong>
          <ul>
            {evidence.evidence_gap.map((gap) => <li key={gap}>{gap}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
