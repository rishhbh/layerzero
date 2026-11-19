export type SourceType = 'pdf' | 'docx' | 'url';

export interface SummaryItem {
  _id: string;
  userId: string;
  title: string;
  sourceType: SourceType;
  sourceHash: string;
  client: string;
  finalSummary: string;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryResponse {
  count: number;
  summaries: SummaryItem[];
  success?: boolean;
  message?: string;
}
