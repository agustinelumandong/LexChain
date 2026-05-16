import { env } from '@/shared/config';

import { apiClient } from './client';
import type { components } from '@lexchain/types/openapi';
import { mockBlockchainApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type RecordDocumentResponse = ApiSchema<'RecordResponse'>;

export type OnChainVerificationResponse =
  ApiSchema<'OnChainVerificationResponse'>;

const encodeDocumentId = (documentId: string) => {
  const trimmed = documentId.trim();

  if (!trimmed) {
    throw new Error('documentId is required');
  }

  return encodeURIComponent(trimmed);
};

export const blockchainApi = {
  notarize: (documentId: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockBlockchainApi.notarize(documentId);
    }

    return apiClient.post<RecordDocumentResponse>(
      `/blockchain/record/${encodedDocumentId}`,
    );
  },

  verify: (documentId: string) => {
    const encodedDocumentId = encodeDocumentId(documentId);

    if (env.useMockApi) {
      return mockBlockchainApi.verify(documentId);
    }

    return apiClient.get<OnChainVerificationResponse>(
      `/blockchain/verify/${encodedDocumentId}`,
    );
  },
};
