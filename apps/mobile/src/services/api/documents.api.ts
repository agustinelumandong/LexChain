import type { DocumentStatusKey, PickedUploadFile } from '@/types';
import type { components } from '@lexchain/types/openapi';

import { apiClient } from './client';

import { env } from '@/shared/config';

import { mockDocumentsApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type DocumentListItem = ApiSchema<'DocumentUploadResponse'> & {
  book_id?: string;
  on_chain?: boolean;
  status: DocumentStatusKey;
};

export type DocumentUploadResponse = DocumentListItem;

export type DocumentDetail = ApiSchema<'DocumentResponse'> & {
  book_id?: string;
  status: DocumentStatusKey;
  storage_url?: string | null;
  file_uri?: string | null;
  file_url?: string | null;
  pdf_url?: string | null;
};

export type DocumentUploadAcceptedResponse =
  ApiSchema<'DocumentUploadAcceptedResponse'>;

export type RenameDocumentRequest = ApiSchema<'RenameDocumentRequest'>;

export type RenameDocumentResponse = DocumentUploadResponse;

export type GlobalSearchPayload = ApiSchema<'SearchRequest'>;

export type GlobalSearchHit = ApiSchema<'GlobalSearchHit'>;

export type GlobalSearchResult = {
  document_id: string;
  hit: GlobalSearchHit;
  rank: number;
  document?: DocumentDetail;
};

export type GlobalSearchResponse = ApiSchema<'GlobalSearchResponse'>;

export type SearchHit = ApiSchema<'SearchHit'>;

export type SearchResponse = ApiSchema<'SearchResponse'>;

export type AskCitation = {
  chunk_id: string;
  chunk_index: number;
  score: number;
};

export type AskChatMessage = ApiSchema<'ChatMessage'>;

export type AskRequest = ApiSchema<'AskRequest'>;

export type AskResponse = {
  question: string;
  answer: string;
  model?: string;
  citations?: AskCitation[];
} & Record<string, unknown>;

export type VersionHistoryItem = ApiSchema<'VersionHistoryItem'>;

export type VersionHistoryResponse = ApiSchema<'VersionHistoryResponse'>;

export type AddPartyRequest = Omit<ApiSchema<'AddPartyRequest'>, 'role'> & {
  role?: ApiSchema<'AddPartyRequest'>['role'];
};

export type DocumentPartyResponse = ApiSchema<'DocumentPartyResponse'>;

export type DocumentPartyListResponse = ApiSchema<'DocumentPartyListResponse'>;

export type RemovePartyResponse = ApiSchema<'RemovePartyResponse'>;
export type AuditLogResponse = ApiSchema<'AuditLogResponse'>;
export type DocumentInvitationResponse = ApiSchema<'DocumentInvitationResponse'>;

export type ListDocumentsParams = {
  bookId?: string;
  limit?: number;
  offset?: number;
};

// Helper to fetch search results with document details
export async function fetchSearchResultsWithDetails(
  payload: GlobalSearchPayload,
): Promise<GlobalSearchResult[]> {
  if (env.useMockApi) {
    return mockDocumentsApi.buildSearchResultsWithDetails(payload);
  }

  const response = await apiClient.post<GlobalSearchResponse>('/search', payload);
  const results = response.results.reduce<GlobalSearchResult[]>((uniqueResults, hit, index) => {
    if (uniqueResults.some((result) => result.document_id === hit.document_id)) {
      return uniqueResults;
    }

    uniqueResults.push({
      document_id: hit.document_id,
      hit,
      rank: index,
    });

    return uniqueResults;
  }, []);

  // Fetch details for each result in parallel
  const resultsWithDetails = await Promise.all(
    results.map(async (result) => {
      try {
        const detail = await apiClient.get<DocumentDetail>(
          `/documents/${encodeURIComponent(result.document_id)}`,
        );
        return { ...result, document: detail };
      } catch {
        // If detail fetch fails, return without details
        return { ...result, document: undefined };
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
  list: (params?: ListDocumentsParams) => {
    if (env.useMockApi) {
      return mockDocumentsApi.list(params);
    }

    return apiClient.get<DocumentListItem[]>(
      `/documents/${toQueryString({
        book_id: params?.bookId,
        limit: params?.limit,
        offset: params?.offset,
      })}`,
    );
  },

  getById: (documentId: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockDocumentsApi.getById(documentId);
    }

    return apiClient.get<DocumentDetail>(`/documents/${encodedDocumentId}`);
  },

  upload: (file: PickedUploadFile, fileName: string, bookId: string) => {
    if (env.useMockApi) {
      return mockDocumentsApi.upload(file, fileName, bookId);
    }

    const searchParams = new URLSearchParams({
      book_id: bookId,
      file_name: fileName,
    });

    return apiClient.post<DocumentUploadAcceptedResponse>(
      `/documents/upload?${searchParams.toString()}`,
      createUploadForm(file),
    );
  },

  updateVersion: (documentId: string, file: PickedUploadFile, fileName: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockDocumentsApi.updateVersion(documentId, file, fileName);
    }

    const searchParams = new URLSearchParams({ file_name: fileName });

    return apiClient.post<DocumentUploadAcceptedResponse>(
      `/documents/${encodedDocumentId}/update?${searchParams.toString()}`,
      createUploadForm(file),
    );
  },

  getVersions: (documentId: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockDocumentsApi.getVersions(documentId);
    }

    return apiClient.get<VersionHistoryResponse>(
      `/documents/${encodedDocumentId}/versions`,
    );
  },

  globalSearch: (payload: GlobalSearchPayload) => {
    if (env.useMockApi) {
      return mockDocumentsApi.globalSearch(payload);
    }

    return apiClient.post<GlobalSearchResponse>('/search', payload);
  },

  rename: (documentId: string, fileName: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockDocumentsApi.rename(documentId, fileName);
    }

    return apiClient.patch<DocumentUploadResponse>(
      `/documents/${encodedDocumentId}`,
      { file_name: fileName },
    );
  },

  getAuditLogs: (documentId: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockDocumentsApi.getAuditLogs(documentId);
    }

    return apiClient.get<AuditLogResponse[]>(
      `/documents/${encodedDocumentId}/audit-logs`,
    );
  },

  search: (documentId: string, query: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockDocumentsApi.search(documentId, query);
    }

    return apiClient.post<SearchResponse>(
      `/documents/${encodedDocumentId}/search`,
      { query },
    );
  },

  ask: (documentId: string, question: string, history: AskChatMessage[] = []) => {
    const encodedDocumentId = encodeDocumentId(documentId);
    const payload: AskRequest = {
      question,
      history,
    };

    if (env.useMockApi) {
      return mockDocumentsApi.ask(documentId, payload);
    }

    return apiClient.post<AskResponse>(
      `/documents/${encodedDocumentId}/ask`,
      payload,
    );
  },

  getPendingInvitations: () => {
    if (env.useMockApi) {
      return mockDocumentsApi.getPendingInvitations();
    }

    return apiClient.get<DocumentInvitationResponse[]>('/documents/invitations');
  },

  acceptInvitation: (documentId: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockDocumentsApi.acceptInvitation(documentId);
    }

    return apiClient.post<Record<string, unknown>>(
      `/documents/${encodedDocumentId}/parties/accept`,
    );
  },

  rejectInvitation: (documentId: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockDocumentsApi.rejectInvitation(documentId);
    }

    return apiClient.post<Record<string, unknown>>(
      `/documents/${encodedDocumentId}/parties/reject`,
    );
  },

  getParties: (documentId: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockDocumentsApi.getParties(documentId);
    }

    return apiClient.get<DocumentPartyListResponse>(
      `/documents/${encodedDocumentId}/parties`,
    );
  },

  addParty: (documentId: string, payload: AddPartyRequest) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockDocumentsApi.addParty(documentId, payload);
    }

    return apiClient.post<DocumentPartyResponse>(
      `/documents/${encodedDocumentId}/parties`,
      payload,
    );
  },

  removeParty: (documentId: string, partyUserId: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);
    const encodedPartyUserId = encodeDocumentId(partyUserId);

    if (env.useMockApi) {
      return mockDocumentsApi.removeParty(documentId, partyUserId);
    }

    return apiClient.delete<RemovePartyResponse>(
      `/documents/${encodedDocumentId}/parties/${encodedPartyUserId}`,
    );
  },
};
