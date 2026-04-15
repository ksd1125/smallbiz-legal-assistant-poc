import type { IntakeInput, IssueCardId } from '@/types/legalAssistant';
import { findIssueCatalogItem } from '@/lib/issueCatalog';

interface GuidedIntakeProps {
  issueCard: IssueCardId;
  intakeMode: IntakeInput['intakeMode'];
  businessType: string;
  stage: string;
  stakeholder: string;
  documentStatus: string;
  interestIssue: string;
  question: string;
  loading: boolean;
  onChange: (patch: Partial<IntakeInput>) => void;
  onSubmit: () => void;
}

export function GuidedIntake({
  issueCard,
  intakeMode,
  businessType,
  stage,
  stakeholder,
  documentStatus,
  interestIssue,
  question,
  loading,
  onChange,
  onSubmit
}: GuidedIntakeProps) {
  const issue = findIssueCatalogItem(issueCard);

  return (
    <form
      className="intakeForm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <input type="hidden" value={issueCard} readOnly />
      <fieldset className="modeSelector">
        <legend>시작 방식</legend>
        <button
          type="button"
          className={intakeMode === 'guided' ? 'modeButton active' : 'modeButton'}
          onClick={() => onChange({ intakeMode: 'guided' })}
        >
          상황에서 고르기
        </button>
        <button
          type="button"
          className={intakeMode === 'open' ? 'modeButton active' : 'modeButton'}
          onClick={() => onChange({ intakeMode: 'open', interestIssue: '' })}
        >
          그냥 질문하기
        </button>
      </fieldset>
      {intakeMode === 'guided' ? (
        <section className="frequentIssues" aria-label="자주 묻는 이슈">
          <p>자주 묻는 이슈</p>
          <div className="chipRow">
            {issue.frequentIssues.map((item) => (
              <button
                key={item.label}
                type="button"
                className={interestIssue === item.label ? 'issueChip active' : 'issueChip'}
                onClick={() => onChange({ interestIssue: item.label, question: item.question })}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="helperText">아래 법률은 적용 확정이 아니라 관련될 수 있는 후보입니다: {issue.relatedLawCandidates.join(', ')}</p>
        </section>
      ) : (
        <p className="helperText">법률명을 몰라도 한 문장으로 질문하세요. AI가 관련 분야와 공식 검색어 후보를 먼저 추정합니다.</p>
      )}
      <label>
        업종
        <input value={businessType} onChange={(event) => onChange({ businessType: event.target.value })} placeholder="예: 카페, 음식점, 온라인 쇼핑몰" />
      </label>
      <label>
        현재 단계
        <select value={stage} onChange={(event) => onChange({ stage: event.target.value })}>
          <option>창업 전</option>
          <option>운영 중</option>
          <option>분쟁 발생</option>
          <option>행정처분 수령</option>
          <option>폐업/양도</option>
        </select>
      </label>
      <label>
        상대방/관계자
        <input value={stakeholder} onChange={(event) => onChange({ stakeholder: event.target.value })} placeholder="예: 임대인, 직원, 고객, 거래처, 행정기관" />
      </label>
      <label>
        날짜가 있는 문서
        <select value={documentStatus} onChange={(event) => onChange({ documentStatus: event.target.value })}>
          <option>아직 없음</option>
          <option>계약서 있음</option>
          <option>고지서/처분서 있음</option>
          <option>문자/이메일 기록 있음</option>
          <option>잘 모르겠음</option>
        </select>
      </label>
      <label>
        궁금한 점
        <textarea value={question} onChange={(event) => onChange({ question: event.target.value })} placeholder="예: 상가 계약 전에 권리금과 원상복구를 어떻게 확인해야 하나요?" />
      </label>
      <p className="privacyNotice">주민등록번호, 계좌번호, 고객명, 계약서 원문, 내부 URL은 입력하지 마세요.</p>
      <button className="primaryButton" type="submit" disabled={loading}>
        {loading ? '확인 중' : '법률정보 후보 찾기'}
      </button>
    </form>
  );
}
