import type { components } from '@lexchain/types/openapi';

import { env } from '@/shared/config';

import { apiClient } from './client';
import { mockRequestsApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type CreateDocumentRequestBody = ApiSchema<'CreateDocumentRequestBody'>;
export type DocumentRequestResponse = ApiSchema<'DocumentRequestResponse'>;
export type DocumentRequestListResponse = ApiSchema<'DocumentRequestListResponse'>;
export type ReviewRequestBody = ApiSchema<'ReviewRequestBody'>;

export type ListDocumentRequestsParams = {
  status?: string;
};

const toQueryString = (params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const requestsApi = {
  create: (payload: CreateDocumentRequestBody) => {
    if (env.useMockApi) {
      return mockRequestsApi.create(payload);
    }

    return apiClient.post<DocumentRequestResponse>('/requests', payload);
  },

  list: (params?: ListDocumentRequestsParams) => {
    if (env.useMockApi) {
      return mockRequestsApi.list(params);
    }

    return apiClient.get<DocumentRequestListResponse>(
      `/requests${toQueryString({ status: params?.status })}`,
    );
  },

  listMine: () => {
    if (env.useMockApi) {
      return mockRequestsApi.listMine();
    }

    return apiClient.get<DocumentRequestListResponse>('/requests/my');
  },

  review: (requestId: string, payload: ReviewRequestBody) => {
    const encodedRequestId = encodeURIComponent(requestId.trim());

    if (!encodedRequestId) {
      throw new Error('requestId is required');
    }

    if (env.useMockApi) {
      return mockRequestsApi.review(requestId, payload);
    }

    return apiClient.patch<DocumentRequestResponse>(
      `/requests/${encodedRequestId}/review`,
      payload,
    );
  },
};
