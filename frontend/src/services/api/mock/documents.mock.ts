import {
  MOCK_DOCUMENT_DETAIL,
  MOCK_DOCUMENT_DETAIL_PROCESSING,
  MOCK_DOCUMENT_LIST,
  MOCK_RENAME_RESPONSE,
  MOCK_UPLOAD_ACCEPTED,
} from './data/documents-api';
import type { PickedUploadFile } from '@/types';

import {
  MOCK_DOCUMENT_SEARCH_RESPONSE,
  MOCK_GLOBAL_SEARCH_RESPONSE,
} from './data/search';

import type {
  AskResponse,
  DocumentDetail,
  DocumentListItem,
  DocumentUploadAcceptedResponse,
  GlobalSearchPayload,
  GlobalSearchResponse,
  RenameDocumentResponse,
  SearchResponse,
} from '../documents.api';

import { mockDelay } from './delay';

let mockDocumentList = [...MOCK_DOCUMENT_LIST];
let mockDocumentDetails: Record<string, DocumentDetail> = {
  [MOCK_DOCUMENT_DETAIL.document_id]: MOCK_DOCUMENT_DETAIL,
  [MOCK_DOCUMENT_DETAIL_PROCESSING.document_id]: MOCK_DOCUMENT_DETAIL_PROCESSING,
};

function buildFallbackDocumentDetail(documentId: string): DocumentDetail {
  const listItem = mockDocumentList.find((document) => document.id === documentId);

  if (!listItem) {
    return {
      ...MOCK_DOCUMENT_DETAIL,
      document_id: documentId,
      file_name: 'Mock Document.pdf',
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
    };
  }

  return {
    ...MOCK_DOCUMENT_DETAIL,
    document_id: listItem.id,
    file_name: listItem.file_name,
    content_type: listItem.content_type,
    status: listItem.status,
    created_at: listItem.created_at,
  };
}

export const mockDocumentsApi = {
  async list(params?: { limit?: number; offset?: number }) {
    await mockDelay();

    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? mockDocumentList.length;

    return mockDocumentList.slice(offset, offset + limit);
  },

  async getById(documentId: string): Promise<DocumentDetail> {
    await mockDelay();

    return mockDocumentDetails[documentId] ?? buildFallbackDocumentDetail(documentId);
  },

  async upload(
    file: PickedUploadFile,
    fileName: string,
  ): Promise<DocumentUploadAcceptedResponse> {
    await mockDelay();

    const documentId = `mock-document-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const listItem: DocumentListItem = {
      id: documentId,
      file_name: fileName,
      content_type: file.mimeType ?? 'application/pdf',
      status: 'QUEUED',
      created_at: createdAt,
    };

    mockDocumentList = [listItem, ...mockDocumentList];
    mockDocumentDetails = {
      ...mockDocumentDetails,
      [documentId]: {
        ...MOCK_DOCUMENT_DETAIL,
        document_id: documentId,
        file_name: fileName,
        content_type: listItem.content_type,
        status: 'QUEUED',
        created_at: createdAt,
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
      document_id: documentId,
      file_name: fileName,
      status: currentDetail.status,
    };
  },

  async search(documentId: string, query: string): Promise<SearchResponse> {
    await mockDelay();

    return {
      ...MOCK_DOCUMENT_SEARCH_RESPONSE,
      document_id: documentId,
      query,
    };
  },

  async ask(documentId: string, question: string): Promise<AskResponse> {
    await mockDelay();

    return {
      question,
      answer:
        'Mock answer: this document looks like a legal or administrative record with extracted summary, entities, and searchable text. Backend Q&A can replace this when the FastAPI service is online.',
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

  buildSearchResultsWithDetails(payload: GlobalSearchPayload) {
    return this.globalSearch(payload).then((response) =>
      response.results.map((hit) => ({
        document_id: hit.document_id,
        document: mockDocumentDetails[hit.document_id] ?? buildFallbackDocumentDetail(hit.document_id),
      })),
    );
  },
};
