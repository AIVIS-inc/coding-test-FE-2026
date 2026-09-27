/**
 * API 응답 타입 (API 명세는 PROBLEM.md 참고)
 * 필요하면 자유롭게 수정·확장하세요.
 */
export type SlideStatus = 'completed' | 'processing' | 'failed';

export interface SlideSummary {
  id: string;
  patientName: string;
  /** UTC ISO 8601 (예: "2026-09-01T16:30:00Z") */
  examinedAt: string;
  status: SlideStatus;
  thumbnailUrl: string;
}

export interface SlideListResponse {
  items: SlideSummary[];
  page: number;
  pageSize: number;
  total: number;
}

export interface SlideAnalysis {
  /** Ki67 양성률 (%). 분석 전·실패 시 null */
  ki67Index: number | null;
  positiveCells: number | null;
  totalCells: number | null;
  /** UTC ISO 8601. 분석 전·실패 시 null */
  analyzedAt: string | null;
}

export interface SlideDetail extends SlideSummary {
  imageUrl: string;
  /** 분석 완료 건만 존재. 그 외 null */
  heatmapUrl: string | null;
  analysis: SlideAnalysis;
}

export interface ApiError {
  message: string;
}
