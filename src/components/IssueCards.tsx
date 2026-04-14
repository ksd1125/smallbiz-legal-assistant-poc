import type { IssueCardId } from '@/types/legalAssistant';
import { issueCatalog } from '@/lib/issueCatalog';

interface IssueCardsProps {
  selected: IssueCardId;
  onSelect: (id: IssueCardId) => void;
}

export function IssueCards({ selected, onSelect }: IssueCardsProps) {
  return (
    <div className="issueGrid">
      {issueCatalog.map((card) => (
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
