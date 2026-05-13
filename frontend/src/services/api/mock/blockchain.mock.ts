import type {
  NotarizeResponse,
  OnChainVerificationResponse,
} from '@/services/api/blockchain.api';

import { mockDelay } from './delay';

export const mockBlockchainApi = {
  async notarize(documentId: string): Promise<NotarizeResponse> {
    await mockDelay();

    return {
      document_id: documentId,
      tx_hash: `0xmock${Date.now().toString(16)}`,
      onchain_document_id: documentId,
      data_hash: 'mock-data-hash',
    };
  },

  async verify(documentId: string): Promise<OnChainVerificationResponse> {
    await mockDelay();

    return {
      document_id: documentId,
      onchain_document_id: documentId,
      data_hash: 'mock-data-hash',
      onchain_timestamp: Math.floor(Date.now() / 1000),
      issued_by: '0xMockIssuer',
      verified_at: new Date().toISOString(),
    };
  },
};
