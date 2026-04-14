import type { IssueCardId } from '@/types/legalAssistant';

const cards: Array<{ id: IssueCardId; title: string; description: string }> = [
  { id: 'startup', title: '창업 준비', description: '인허가, 임대차, 사업 시작 전 확인' },
  { id: 'lease', title: '상가 임대차', description: '보증금, 권리금, 갱신, 원상복구' },
  { id: 'employment', title: '직원/아르바이트', description: '근로계약, 임금, 휴게, 해고' },
  { id: 'contract', title: '계약서/약관', description: '위험 후보 조항과 확인 항목' },
  { id: 'consumer', title: '환불/소비자 분쟁', description: '환불, 교환, 민원 대응' },
  { id: 'debt', title: '미수금/내용증명', description: '대금 미지급과 절차 확인' },
  { id: 'administrative', title: '행정처분/과태료', description: '영업정지, 과태료, 행정심판' },
  { id: 'closure', title: '폐업/양도', description: '폐업신고, 양도, 계약 종료' }
];

interface IssueCardsProps {
  selected: IssueCardId;
  onSelect: (id: IssueCardId) => void;
}

export function IssueCards({ selected, onSelect }: IssueCardsProps) {
  return (
    <div className="issueGrid">
      {cards.map((card) => (
        <button
          key={card.id}
          className={selected === card.id ? 'issueCard selected' : 'issueCard'}
          type="button"
          onClick={() => onSelect(card.id)}
        >
          <strong>{card.title}</strong>
          <span>{card.description}</span>
        </button>
      ))}
    </div>
  );
}
