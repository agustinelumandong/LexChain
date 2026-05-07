import type { PickedUploadFile } from '@/types';

import { apiClient } from './client';

export type DocumentListItem = {
  id: string;
  file_name: string;
  content_type: string;
  status: string;
  created_at: string;
};

export type DocumentDetail = {
  document_id: string;
  file_name: string;
  content_type: string;
  status: string;
  summary?: string | null;
  labels?: string[];
  entities?: Record<string, unknown>[];
  risk_flags?: Record<string, unknown>[];
  created_at: string;
};

export type DocumentUploadAcceptedResponse = {
  document_id: string;
  status: string;
  message: string;
};

export type GlobalSearchPayload = {
  query: string;
};

export type GlobalSearchHit = {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  score: number;
  text: string;
};

export type GlobalSearchResponse = {
  query: string;
  results: GlobalSearchHit[];
};

function createUploadForm(file: PickedUploadFile) {
  const formData = new FormData();

  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  } as unknown as Blob);

  return formData;
}

export const documentsApi = {
  list: () => apiClient.get<DocumentListItem[]>('/documents/'),

  detail: (documentId: string) =>
    apiClient.get<DocumentDetail>(`/documents/${encodeURIComponent(documentId)}`),

  upload: (file: PickedUploadFile) =>
    apiClient.post<DocumentUploadAcceptedResponse>('/documents/upload', createUploadForm(file)),

  globalSearch: (payload: GlobalSearchPayload) =>
    apiClient.post<GlobalSearchResponse>('/search', payload),
};
