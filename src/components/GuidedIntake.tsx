import type { IntakeInput, IssueCardId } from '@/types/legalAssistant';

interface GuidedIntakeProps {
  issueCard: IssueCardId;
  businessType: string;
  stage: string;
  question: string;
  loading: boolean;
  onChange: (patch: Partial<IntakeInput>) => void;
  onSubmit: () => void;
}

export function GuidedIntake({ issueCard, businessType, stage, question, loading, onChange, onSubmit }: GuidedIntakeProps) {
  return (
    <form
      className="intakeForm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <input type="hidden" value={issueCard} readOnly />
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
        궁금한 점
        <textarea value={question} onChange={(event) => onChange({ question: event.target.value })} placeholder="예: 상가 계약 전에 권리금과 원상복구를 어떻게 확인해야 하나요?" />
      </label>
      <p className="privacyNotice">주민등록번호, 계좌번호, 고객명, 계약서 원문, 내부 URL은 입력하지 마세요.</p>
      <button className="primaryButton" type="submit" disabled={loading || question.trim().length === 0}>
        {loading ? '확인 중' : '법률정보 후보 찾기'}
      </button>
    </form>
  );
}
