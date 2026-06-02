import type {
  OnChainVerificationResponse,
  RecordDocumentResponse,
} from '@/services/api/blockchain.api';

import { mockDelay } from './delay';

export const mockBlockchainApi = {
  async notarize(documentId: string): Promise<RecordDocumentResponse> {
    await mockDelay();

    return {
      document_id: documentId,
      tx_hash: `0xmock${Date.now().toString(16)}`,
      onchain_document_id: documentId,
      data_hash: 'mock-data-hash',
      transacttion_link: 'https://basescan.org/tx/0xmock',
    };
  },

  async verify(documentId: string): Promise<OnChainVerificationResponse> {
    await mockDelay();

    return {
      document_id: documentId,
      onchain_document_id: documentId,
      data_hash: 'mock-document-hash',
      tx_hash: '0xmockverified',
      onchain_timestamp: Math.floor(Date.now() / 1000),
      issued_by: '0xMockIssuer',
      verified_at: new Date().toISOString(),
      transacttion_link: 'https://basescan.org/tx/0xmockverified',
      is_verified: true,
    };
  },
};
