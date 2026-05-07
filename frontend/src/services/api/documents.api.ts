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
  document_id: string;
};

export type GlobalSearchResult = {
  document_id: string;
  document?: DocumentDetail;
};

export type GlobalSearchResponse = {
  query: string;
  results: GlobalSearchHit[];
};

// Helper to fetch search results with document details
export async function fetchSearchResultsWithDetails(
  payload: GlobalSearchPayload,
): Promise<GlobalSearchResult[]> {
  const response = await apiClient.post<GlobalSearchResponse>('/search', payload);
  const results = response.results;

  // Fetch details for each result in parallel
  const resultsWithDetails = await Promise.all(
    results.map(async (hit) => {
      try {
        const detail = await apiClient.get<DocumentDetail>(
          `/documents/${encodeURIComponent(hit.document_id)}`,
        );
        return { document_id: hit.document_id, document: detail };
      } catch {
        // If detail fetch fails, return without details
        return { document_id: hit.document_id, document: undefined };
      }
    }),
  );

  return resultsWithDetails;
}

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
