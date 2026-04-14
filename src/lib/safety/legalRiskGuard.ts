export const legalNotice = '아래 내용은 법률정보 탐색을 돕기 위한 참고자료이며, 개별 사건에 대한 법률 자문은 아닙니다.';

const blockedPhrases = [
  '승소합니다',
  '반드시 승소',
  '위법입니다',
  '불법입니다',
  '계약을 즉시 해지',
  '소송을 제기하세요',
  '고소하세요'
];

export function findLocalRiskPhrases(text: string): string[] {
  return blockedPhrases.filter((phrase) => text.includes(phrase));
}

export function appendLegalNotice(text: string): string {
  if (text.includes(legalNotice)) {
    return text;
  }
  return `${text}\n\n${legalNotice}`;
}
