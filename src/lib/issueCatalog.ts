import type { IssueCardId } from '@/types/legalAssistant';

export interface FrequentIssue {
  label: string;
  question: string;
}

export interface IssueCatalogItem {
  id: IssueCardId;
  title: string;
  description: string;
  frequentIssues: FrequentIssue[];
  relatedLawCandidates: string[];
}

// 자주 묻는 이슈는 법률 결론이 아니라 검색과 상담 준비를 돕는 질문 예시다.
export const issueCatalog: IssueCatalogItem[] = [
  {
    id: 'startup',
    title: '창업 준비',
    description: '인허가, 임대차, 사업 시작 전 확인',
    frequentIssues: [
      { label: '인허가', question: '창업 전에 우리 업종에서 먼저 확인해야 할 인허가가 무엇인가요?' },
      { label: '상가 계약', question: '창업 전에 상가 계약서에서 어떤 항목을 확인해야 하나요?' },
      { label: '표시광고', question: '온라인 홍보를 시작하기 전에 표시광고 관련해서 무엇을 확인해야 하나요?' }
    ],
    relatedLawCandidates: ['식품위생법', '상가건물 임대차보호법', '부가가치세법', '표시ㆍ광고의 공정화에 관한 법률']
  },
  {
    id: 'lease',
    title: '상가 임대차',
    description: '보증금, 권리금, 갱신, 원상복구',
    frequentIssues: [
      { label: '권리금', question: '상가 임대차에서 권리금 회수 기회를 보호받을 수 있는지 확인하려면 무엇이 필요한가요?' },
      { label: '계약갱신', question: '상가 임대차 계약갱신을 요구할 수 있는지 확인하려면 어떤 정보를 봐야 하나요?' },
      { label: '원상복구', question: '상가 계약 종료 시 원상복구 범위를 확인하려면 어떤 조항을 봐야 하나요?' },
      { label: '보증금 반환', question: '임대인이 보증금을 돌려주지 않을 때 먼저 준비할 자료는 무엇인가요?' }
    ],
    relatedLawCandidates: ['상가건물 임대차보호법', '민법', '민사집행법', '소액사건심판법']
  },
  {
    id: 'employment',
    title: '직원/아르바이트',
    description: '근로계약, 임금, 휴게, 해고',
    frequentIssues: [
      { label: '근로계약서', question: '아르바이트 근로계약서를 작성할 때 꼭 확인해야 할 항목은 무엇인가요?' },
      { label: '주휴수당', question: '주휴수당 지급 여부를 확인하려면 어떤 근무 정보를 봐야 하나요?' },
      { label: '해고', question: '직원을 그만두게 할 때 절차상 먼저 확인할 사항은 무엇인가요?' },
      { label: '퇴직금', question: '퇴직금 지급 대상인지 확인하려면 어떤 조건을 봐야 하나요?' }
    ],
    relatedLawCandidates: ['근로기준법', '최저임금법', '근로자퇴직급여 보장법', '기간제 및 단시간근로자 보호 등에 관한 법률']
  },
  {
    id: 'contract',
    title: '계약서/약관',
    description: '위험 후보 조항과 확인 항목',
    frequentIssues: [
      { label: '위약금', question: '계약서의 위약금 조항이 과도한지 확인하려면 어떤 항목을 봐야 하나요?' },
      { label: '자동연장', question: '계약 자동연장 조항에서 확인해야 할 위험 후보는 무엇인가요?' },
      { label: '환불약관', question: '환불약관을 만들 때 소비자 분쟁을 줄이려면 무엇을 확인해야 하나요?' }
    ],
    relatedLawCandidates: ['민법', '약관의 규제에 관한 법률', '전자상거래 등에서의 소비자보호에 관한 법률']
  },
  {
    id: 'consumer',
    title: '환불/소비자 분쟁',
    description: '환불, 교환, 민원 대응',
    frequentIssues: [
      { label: '환불', question: '고객 환불 요청에 대응하기 전에 어떤 기준과 자료를 확인해야 하나요?' },
      { label: '교환', question: '제품 교환 요청이 들어왔을 때 사업자가 먼저 확인할 항목은 무엇인가요?' },
      { label: '민원', question: '소비자 민원이 접수되었을 때 대응 기록은 어떻게 정리하면 좋나요?' }
    ],
    relatedLawCandidates: ['소비자기본법', '전자상거래 등에서의 소비자보호에 관한 법률', '민법']
  },
  {
    id: 'debt',
    title: '미수금/내용증명',
    description: '대금 미지급과 절차 확인',
    frequentIssues: [
      { label: '내용증명', question: '거래처가 대금을 주지 않을 때 내용증명 전에 준비할 자료는 무엇인가요?' },
      { label: '지급명령', question: '미수금 지급명령을 검토하기 전에 어떤 정보를 확인해야 하나요?' },
      { label: '소액사건', question: '소액사건으로 진행할 수 있는지 확인하려면 어떤 조건을 봐야 하나요?' }
    ],
    relatedLawCandidates: ['민법', '민사소송법', '소액사건심판법']
  },
  {
    id: 'administrative',
    title: '행정처분/과태료',
    description: '영업정지, 과태료, 행정심판',
    frequentIssues: [
      { label: '영업정지', question: '영업정지 처분서를 받았을 때 먼저 확인해야 할 기한과 절차는 무엇인가요?' },
      { label: '과태료', question: '과태료 통지를 받았을 때 의견제출이나 이의제기 기한은 어떻게 확인하나요?' },
      { label: '행정심판', question: '행정심판을 검토하려면 어떤 처분서와 날짜 정보를 준비해야 하나요?' }
    ],
    relatedLawCandidates: ['행정심판법', '행정절차법', '질서위반행위규제법']
  },
  {
    id: 'closure',
    title: '폐업/양도',
    description: '폐업신고, 양도, 계약 종료',
    frequentIssues: [
      { label: '폐업신고', question: '폐업할 때 세금과 계약 관련해서 먼저 확인해야 할 사항은 무엇인가요?' },
      { label: '권리양도', question: '가게를 양도할 때 권리금과 임대차 계약에서 확인해야 할 항목은 무엇인가요?' },
      { label: '직원 정리', question: '폐업 전 직원에게 안내하거나 정산할 항목은 무엇인가요?' }
    ],
    relatedLawCandidates: ['부가가치세법', '근로기준법', '상가건물 임대차보호법', '민법']
  }
];

export function findIssueCatalogItem(id: IssueCardId): IssueCatalogItem {
  return issueCatalog.find((item) => item.id === id) ?? issueCatalog[0];
}
