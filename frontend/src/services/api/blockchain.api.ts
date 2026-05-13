import { env } from '@/shared/config';

import { apiClient } from './client';
import { mockBlockchainApi } from './mock';

export type NotarizeResponse = {
  document_id: string;
  tx_hash: string;
  onchain_document_id: string;
  data_hash: string;
};

export type OnChainVerificationResponse = {
  document_id: string;
  onchain_document_id: string;
  data_hash: string;
  onchain_timestamp: number;
  issued_by: string;
  verified_at: string;
};

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

    return apiClient.post<NotarizeResponse>(
      `/blockchain/notarize/${encodedDocumentId}`,
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
