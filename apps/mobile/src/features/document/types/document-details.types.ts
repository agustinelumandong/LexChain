export type VersionHistoryItem = {
  id: string;
  documentId?: string;
  date: string;
  fileName?: string;
  label: string;
  statusLabel?: string;
  description: string;
  isCurrent?: boolean;
  uri?: string | null;
};

export type DetailBodyBlock =
  | {
      kind: 'group';
      title: string;
      values: string[];
    }
  | {
      kind: 'risk';
      severity?: string;
      text: string;
    };

export type DocumentDetailsDocument = {
  document_id: string;
  file_name: string;
  content_type: string;
  created_at: string;
  updated_at: string;
  status: string;
  on_chain?: boolean;
  summary?: string | null;
  storage_url?: string | null;
  file_uri?: string | null;
  file_url?: string | null;
  pdf_url?: string | null;
  entities?: Record<string, unknown>[];
  risk_flags?: Record<string, unknown>[];
};

export type DocumentDetailsVersion = {
  document_id: string;
  file_name: string;
  status: string;
  is_latest: boolean;
  created_at: string;
  storage_url?: string | null;
};
