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

export type RenameDocumentRequest = {
  file_name: string;
};

export type RenameDocumentResponse = {
  document_id: string;
  file_name: string;
  status: string;
};

export type GlobalSearchPayload = {
  query: string;
};

export type GlobalSearchHit = {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  score: number;
};

export type GlobalSearchResult = {
  document_id: string;
  document?: DocumentDetail;
};

export type GlobalSearchResponse = {
  query: string;
  results: GlobalSearchHit[];
};

export type SearchHit = {
  chunk_id: string;
  chunk_index: number;
  score: number;
  text: string;
};

export type SearchResponse = {
  query: string;
  document_id: string;
  results: SearchHit[];
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

  upload: (file: PickedUploadFile, fileName: string) =>
    apiClient.post<DocumentUploadAcceptedResponse>(
      `/documents/upload?file_name=${encodeURIComponent(fileName)}`,
      createUploadForm(file),
    ),

  globalSearch: (payload: GlobalSearchPayload) =>
    apiClient.post<GlobalSearchResponse>('/search', payload),

  rename: (documentId: string, fileName: string) =>
    apiClient.patch<RenameDocumentResponse>(
      `/documents/${encodeURIComponent(documentId)}/`,
      { file_name: fileName },
    ),

  search: (documentId: string, query: string) =>
    apiClient.post<SearchResponse>(
      `/documents/${encodeURIComponent(documentId)}/search`,
      { query },
    ),
};
