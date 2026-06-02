import type {
  CreateDocumentRequestBody,
  DocumentRequestListResponse,
  DocumentRequestResponse,
  ListDocumentRequestsParams,
  ReviewRequestBody,
} from '../requests.api';

import { mockDelay } from './delay';

let mockRequests: DocumentRequestResponse[] = [
  {
    id: 'mock-request-1',
    requester_id: 'mock-user',
    requester_email: 'client@example.com',
    requester_name: 'Mock Client',
    document_type: 'Certificate of Registration',
    description: 'Client requested a certified digital copy.',
    status: 'pending',
    lawyer_id: null,
    rejection_reason: null,
    created_at: '2026-06-02T08:00:00.000Z',
    updated_at: '2026-06-02T08:00:00.000Z',
  },
];

export const mockRequestsApi = {
  async create(payload: CreateDocumentRequestBody): Promise<DocumentRequestResponse> {
    await mockDelay();

    const timestamp = new Date().toISOString();
    const request: DocumentRequestResponse = {
      id: `mock-request-${Date.now()}`,
      requester_id: 'mock-user',
      requester_email: 'client@example.com',
      requester_name: 'Mock Client',
      document_type: payload.document_type,
      description: payload.description,
      status: 'pending',
      lawyer_id: null,
      rejection_reason: null,
      created_at: timestamp,
      updated_at: timestamp,
    };

    mockRequests = [request, ...mockRequests];

    return request;
  },

  async list(params?: ListDocumentRequestsParams): Promise<DocumentRequestListResponse> {
    await mockDelay();

    const requests = params?.status
      ? mockRequests.filter((request) => request.status === params.status)
      : mockRequests;

    return {
      requests,
      total: requests.length,
    };
  },

  async listMine(): Promise<DocumentRequestListResponse> {
    await mockDelay();

    return {
      requests: mockRequests,
      total: mockRequests.length,
    };
  },

  async review(
    requestId: string,
    payload: ReviewRequestBody,
  ): Promise<DocumentRequestResponse> {
    await mockDelay();

    const request = mockRequests.find((entry) => entry.id === requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const reviewed: DocumentRequestResponse = {
      ...request,
      status: payload.action === 'approve' ? 'approved' : 'rejected',
      lawyer_id: 'mock-lawyer',
      rejection_reason:
        payload.action === 'reject' ? payload.rejection_reason ?? null : null,
      updated_at: new Date().toISOString(),
    };

    mockRequests = mockRequests.map((entry) =>
      entry.id === requestId ? reviewed : entry,
    );

    return reviewed;
  },
};
