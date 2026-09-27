/**
 * Mock 데이터 (고정 시드 → 모든 지원자에게 동일한 데이터)
 */
export type SlideStatus = 'completed' | 'processing' | 'failed';

export interface SlideRecord {
  id: string;
  patientName: string;
  examinedAt: string; // UTC ISO 8601
  status: SlideStatus;
  imageKey: number; // 1~6
  analysis: {
    ki67Index: number | null; // 0~100 (%)
    positiveCells: number | null;
    totalCells: number | null;
    analyzedAt: string | null; // UTC ISO 8601
  };
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260927);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];

const LAST = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권'] as const;
const FIRST = ['민준', '서연', '도윤', '하은', '지호', '수아', '예준', '지우', '시우', '서윤', '주원', '하린', '지민', '유진', '현우'] as const;

/** 고정 레코드 */
const PLANTED: Record<number, Partial<SlideRecord> & { analysisOverride?: SlideRecord['analysis'] }> = {
  3: { patientName: '김민', status: 'completed' },
  7: { patientName: '남궁민수', status: 'completed' },
  10: {
    patientName: '홍길동',
    status: 'completed',
    analysisOverride: { ki67Index: 0, positiveCells: 0, totalCells: 8421, analyzedAt: '2026-09-02T02:10:00Z' },
  },
  14: { patientName: '이안', status: 'processing' },
  21: { patientName: '선우정아', status: 'failed' },
  33: { patientName: '독고영재', status: 'completed' },
};

const TOTAL = 57;

function buildRecord(n: number): SlideRecord {
  const planted = PLANTED[n] ?? {};
  const status: SlideStatus =
    planted.status ?? (rand() < 0.72 ? 'completed' : rand() < 0.6 ? 'processing' : 'failed');

  const day = 1 + Math.floor(rand() * 117);
  const base = Date.UTC(2026, 5, 1) + day * 86_400_000;
  const hour = rand() < 0.5 ? 15 + Math.floor(rand() * 9) : Math.floor(rand() * 15);
  const minute = Math.floor(rand() * 60);
  const examined = new Date(base + hour * 3_600_000 + minute * 60_000);

  let analysis: SlideRecord['analysis'];
  if (planted.analysisOverride) {
    analysis = planted.analysisOverride;
  } else if (status === 'completed') {
    const totalCells = 3000 + Math.floor(rand() * 12000);
    const ki67 = Math.round(rand() * 6000) / 100; // 0.00 ~ 60.00
    analysis = {
      ki67Index: ki67,
      positiveCells: Math.round((totalCells * ki67) / 100),
      totalCells,
      analyzedAt: new Date(examined.getTime() + (2 + Math.floor(rand() * 20)) * 3_600_000).toISOString(),
    };
  } else {
    analysis = { ki67Index: null, positiveCells: null, totalCells: null, analyzedAt: null };
  }

  return {
    id: `S-2026-${String(n).padStart(4, '0')}`,
    patientName: planted.patientName ?? `${pick(LAST)}${pick(FIRST)}`,
    examinedAt: examined.toISOString().replace('.000Z', 'Z'),
    status,
    imageKey: ((n - 1) % 6) + 1,
    analysis,
  };
}

export const slides: SlideRecord[] = Array.from({ length: TOTAL }, (_, i) => buildRecord(i + 1))
  // 최신 검사일 순 정렬
  .sort((a, b) => b.examinedAt.localeCompare(a.examinedAt));
