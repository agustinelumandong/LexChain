import {
  MOCK_DOCUMENT_DETAIL,
  MOCK_DOCUMENT_DETAIL_VERSION_1,
  MOCK_DOCUMENT_DETAIL_VERSION_2,
  MOCK_DOCUMENT_DETAIL_PROCESSING,
  MOCK_DOCUMENT_PARTIES_RESPONSE,
  MOCK_DOCUMENT_LIST,
  MOCK_RENAME_RESPONSE,
  MOCK_UPLOAD_ACCEPTED,
  MOCK_VERSION_HISTORY_RESPONSE,
} from './data/documents-api';
import type { PickedUploadFile } from '@/types';

import {
  MOCK_DOCUMENT_SEARCH_RESPONSE,
  MOCK_GLOBAL_SEARCH_RESPONSE,
} from './data/search';

import type {
  AskRequest,
  AskResponse,
  AddPartyRequest,
  AuditLogResponse,
  DocumentDetail,
  DocumentInvitationResponse,
  DocumentListItem,
  DocumentPartyListResponse,
  DocumentPartyResponse,
  DocumentUploadAcceptedResponse,
  GlobalSearchPayload,
  GlobalSearchResponse,
  GlobalSearchResult,
  ListDocumentsParams,
  RemovePartyResponse,
  RenameDocumentResponse,
  SearchResponse,
  VersionHistoryResponse,
} from '../documents.api';

import { mockDelay } from './delay';

let mockDocumentList = [...MOCK_DOCUMENT_LIST];
let mockDocumentDetails: Record<string, DocumentDetail> = {
  [MOCK_DOCUMENT_DETAIL.document_id]: MOCK_DOCUMENT_DETAIL,
  [MOCK_DOCUMENT_DETAIL_VERSION_1.document_id]: MOCK_DOCUMENT_DETAIL_VERSION_1,
  [MOCK_DOCUMENT_DETAIL_VERSION_2.document_id]: MOCK_DOCUMENT_DETAIL_VERSION_2,
  [MOCK_DOCUMENT_DETAIL_PROCESSING.document_id]: MOCK_DOCUMENT_DETAIL_PROCESSING,
};

let mockDocumentInvitations: DocumentInvitationResponse[] = [
  {
    id: 'mock-party-invite-1',
    document_id: '550e8400-e29b-41d4-a716-446655440002',
    document_title: 'Lease Agreement - Rivera Holdings.pdf',
    role: 'viewer',
    status: 'pending',
    created_at: '2026-05-31T08:00:00.000Z',
  },
];

function buildFallbackDocumentDetail(documentId: string): DocumentDetail {
  const listItem = mockDocumentList.find((document) => document.id === documentId);

  if (!listItem) {
    return {
      ...MOCK_DOCUMENT_DETAIL,
      document_id: documentId,
      file_name: 'Mock Document.pdf',
      storage_url: `mock://documents/${documentId}`,
      status: 'COMPLETED',
      is_latest: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return {
    ...MOCK_DOCUMENT_DETAIL,
    document_id: listItem.id,
    book_id: listItem.book_id,
    file_name: listItem.file_name,
    content_type: listItem.content_type,
    status: listItem.status,
    created_at: listItem.created_at,
  };
}

const MOCK_AUDIT_LOGS: AuditLogResponse[] = [
  {
    id: '8a4af968-2798-4a5e-8b56-4411246f2f22',
    document_id: MOCK_DOCUMENT_DETAIL.document_id,
    user_id: 'mock-lawyer-user',
    action: 'document_uploaded',
    details: { file_name: MOCK_DOCUMENT_DETAIL.file_name },
    created_at: '2026-05-20T08:45:00.000Z',
  },
  {
    id: '020b5a1d-0f3e-4de1-9d9e-cd61b3841914',
    document_id: MOCK_DOCUMENT_DETAIL.document_id,
    user_id: 'mock-lawyer-user',
    action: 'party_added',
    details: { role: 'viewer', party: 'Maria Santos' },
    created_at: '2026-05-20T09:15:00.000Z',
  },
  {
    id: 'c013838f-9f3a-4a23-903d-79f4e59d7f18',
    document_id: MOCK_DOCUMENT_DETAIL.document_id,
    user_id: null,
    action: 'document_recorded',
    details: { network: 'local-chain' },
    created_at: '2026-05-21T11:30:00.000Z',
  },
];

export const mockDocumentsApi = {
  async list(params?: ListDocumentsParams) {
    await mockDelay();

    const offset = params?.offset ?? 0;
    const filteredDocuments = params?.bookId
      ? mockDocumentList.filter((document) => document.book_id === params.bookId)
      : mockDocumentList;
    const limit = params?.limit ?? filteredDocuments.length;

    return filteredDocuments.slice(offset, offset + limit);
  },

  async getById(documentId: string): Promise<DocumentDetail> {
    await mockDelay();

    return mockDocumentDetails[documentId] ?? buildFallbackDocumentDetail(documentId);
  },

  async upload(
    file: PickedUploadFile,
    fileName: string,
    bookId: string,
  ): Promise<DocumentUploadAcceptedResponse> {
    await mockDelay();

    const documentId = `mock-document-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const documentNumber = mockDocumentList.length + 1;

    const listItem: DocumentListItem = {
      id: documentId,
      document_number: documentNumber,
      file_name: fileName,
      content_type: file.mimeType ?? 'application/pdf',
      status: 'QUEUED',
      on_chain: false,
      book_id: bookId,
      book_number: 0,
      page_number: 0,
      series: 0,
      created_at: createdAt,
    };

    mockDocumentList = [listItem, ...mockDocumentList];
    mockDocumentDetails = {
      ...mockDocumentDetails,
      [documentId]: {
        ...MOCK_DOCUMENT_DETAIL,
        document_id: documentId,
        document_number: documentNumber,
        file_name: fileName,
        storage_url: `mock://documents/${documentId}`,
        content_type: listItem.content_type,
        status: 'QUEUED',
        book_id: bookId,
        is_latest: true,
        created_at: createdAt,
        updated_at: createdAt,
        summary: null,
        labels: [],
        entities: [],
        risk_flags: [],
      },
    };

    return {
      ...MOCK_UPLOAD_ACCEPTED,
      document_id: documentId,
      status: 'QUEUED',
    };
  },

  async updateVersion(
    documentId: string,
    file: PickedUploadFile,
    fileName: string,
  ): Promise<DocumentUploadAcceptedResponse> {
    await mockDelay();

    const currentDetail = mockDocumentDetails[documentId] ?? buildFallbackDocumentDetail(documentId);
    const updatedAt = new Date().toISOString();

    mockDocumentDetails = {
      ...mockDocumentDetails,
      [documentId]: {
        ...currentDetail,
        file_name: fileName,
        content_type: file.mimeType ?? currentDetail.content_type,
        status: 'QUEUED',
        is_latest: true,
        updated_at: updatedAt,
      },
    };

    mockDocumentList = mockDocumentList.map((document) =>
      document.id === documentId
        ? {
            ...document,
            file_name: fileName,
            content_type: file.mimeType ?? document.content_type,
            status: 'QUEUED',
          }
        : document,
    );

    return {
      document_id: documentId,
      status: 'QUEUED',
      message: 'Document update accepted for processing',
    };
  },

  async getVersions(documentId: string): Promise<VersionHistoryResponse> {
    await mockDelay();

    const detail = mockDocumentDetails[documentId] ?? buildFallbackDocumentDetail(documentId);
    const isPrimaryMockDocument = documentId === MOCK_VERSION_HISTORY_RESPONSE.current_document_id;

    if (isPrimaryMockDocument) {
      return MOCK_VERSION_HISTORY_RESPONSE;
    }

    return {
      ...MOCK_VERSION_HISTORY_RESPONSE,
      current_document_id: documentId,
      total_version: 1,
      versions: [
        {
          ...MOCK_VERSION_HISTORY_RESPONSE.versions[0],
          document_id: documentId,
          file_name: detail.file_name,
          status: detail.status,
          is_latest: detail.is_latest,
          created_at: detail.created_at,
        },
      ],
    };
  },

  async globalSearch(payload: GlobalSearchPayload): Promise<GlobalSearchResponse> {
    await mockDelay();

    return {
      ...MOCK_GLOBAL_SEARCH_RESPONSE,
      query: payload.query,
    };
  },

  async rename(
    documentId: string,
    fileName: string,
  ): Promise<RenameDocumentResponse> {
    await mockDelay();

    mockDocumentList = mockDocumentList.map((document) =>
      document.id === documentId ? { ...document, file_name: fileName } : document,
    );

    const currentDetail = mockDocumentDetails[documentId] ?? buildFallbackDocumentDetail(documentId);
    mockDocumentDetails = {
      ...mockDocumentDetails,
      [documentId]: {
        ...currentDetail,
        file_name: fileName,
      },
    };

    return {
      ...MOCK_RENAME_RESPONSE,
      id: documentId,
      file_name: fileName,
      content_type: currentDetail.content_type,
      status: currentDetail.status,
      on_chain: Boolean(currentDetail.on_chain),
      created_at: currentDetail.created_at,
    };
  },

  async getAuditLogs(documentId: string): Promise<AuditLogResponse[]> {
    await mockDelay();

    const logs = MOCK_AUDIT_LOGS.filter((log) => log.document_id === documentId);

    if (logs.length > 0) {
      return logs;
    }

    const detail = mockDocumentDetails[documentId] ?? buildFallbackDocumentDetail(documentId);

    return [
      {
        id: `mock-audit-${documentId}`,
        document_id: documentId,
        user_id: null,
        action: 'document_uploaded',
        details: { file_name: detail.file_name },
        created_at: detail.created_at,
      },
    ];
  },

  async search(documentId: string, query: string): Promise<SearchResponse> {
    await mockDelay();

    return {
      ...MOCK_DOCUMENT_SEARCH_RESPONSE,
      document_id: documentId,
      query,
    };
  },

  async ask(documentId: string, payload: AskRequest): Promise<AskResponse> {
    await mockDelay();

    return {
      question: payload.question,
      answer:
        payload.history.length > 0
          ? 'Mock answer: using your previous chat context, this document still looks like a legal or administrative record with extracted summary, entities, and searchable text.'
          : 'Mock answer: this document looks like a legal or administrative record with extracted summary, entities, and searchable text. Backend Q&A can replace this when the FastAPI service is online.',
      model: 'mock-local',
      citations: [
        {
          chunk_id: `${documentId}-chunk-1`,
          chunk_index: 1,
          score: 0.98,
        },
      ],
    };
  },

  async getPendingInvitations(): Promise<DocumentInvitationResponse[]> {
    await mockDelay();

    return mockDocumentInvitations;
  },

  async acceptInvitation(documentId: string): Promise<Record<string, unknown>> {
    await mockDelay();

    mockDocumentInvitations = mockDocumentInvitations.filter(
      (invitation) => invitation.document_id !== documentId,
    );

    return {
      document_id: documentId,
      status: 'accepted',
      message: 'Mock invitation accepted',
    };
  },

  async rejectInvitation(documentId: string): Promise<Record<string, unknown>> {
    await mockDelay();

    mockDocumentInvitations = mockDocumentInvitations.filter(
      (invitation) => invitation.document_id !== documentId,
    );

    return {
      document_id: documentId,
      status: 'rejected',
      message: 'Mock invitation rejected',
    };
  },

  async getParties(documentId: string): Promise<DocumentPartyListResponse> {
    await mockDelay();

    return {
      ...MOCK_DOCUMENT_PARTIES_RESPONSE,
      document_id: documentId,
    };
  },

  async addParty(
    _documentId: string,
    payload: AddPartyRequest,
  ): Promise<DocumentPartyResponse> {
    await mockDelay();

    return {
      id: `mock-party-${Date.now()}`,
      user_id: `mock-user-${payload.email.toLowerCase()}`,
      email: payload.email,
      f_name: 'Invited',
      l_name: 'User',
      role: payload.role ?? 'viewer',
      status: 'pending',
      created_at: new Date().toISOString(),
    };
  },

  async removeParty(
    documentId: string,
    partyUserId: string,
  ): Promise<RemovePartyResponse> {
    await mockDelay();

    return {
      document_id: documentId,
      user_id: partyUserId,
      message: 'Mock party removed from document',
    };
  },

  buildSearchResultsWithDetails(payload: GlobalSearchPayload) {
    return this.globalSearch(payload).then((response) =>
      response.results.reduce<GlobalSearchResult[]>((uniqueResults, hit, index) => {
        if (uniqueResults.some((result) => result.document_id === hit.document_id)) {
          return uniqueResults;
        }

        uniqueResults.push({
          document_id: hit.document_id,
          hit,
          rank: index,
          document: mockDocumentDetails[hit.document_id] ?? buildFallbackDocumentDetail(hit.document_id),
        });

        return uniqueResults;
      }, []),
    );
  },
};
