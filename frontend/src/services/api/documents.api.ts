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

const toQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const encodeDocumentId = (documentId: string) => {
  const trimmed = documentId.trim();

  if (!trimmed) {
    throw new Error('documentId is required');
  }

  return encodeURIComponent(trimmed);
};

export const documentsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<DocumentListItem[]>(
      `/documents/${toQueryString({
        limit: params?.limit,
        offset: params?.offset,
      })}`,
    ),

  getById: (documentId: string) =>
    apiClient.get<DocumentDetail>(`/documents/${encodeDocumentId(documentId)}`),

  upload: (file: PickedUploadFile, fileName: string) => {
    const searchParams = new URLSearchParams({ file_name: fileName });

    return apiClient.post<DocumentUploadAcceptedResponse>(
      `/documents/upload?${searchParams.toString()}`,
      createUploadForm(file),
    );
  },

  globalSearch: (payload: GlobalSearchPayload) =>
    apiClient.post<GlobalSearchResponse>('/search', payload),

  rename: (documentId: string, fileName: string) =>
    apiClient.patch<RenameDocumentResponse>(
      `/documents/${encodeDocumentId(documentId)}/`,
      { file_name: fileName },
    ),

  search: (documentId: string, query: string) =>
    apiClient.post<SearchResponse>(
      `/documents/${encodeDocumentId(documentId)}/search`,
      { query },
    ),
};
