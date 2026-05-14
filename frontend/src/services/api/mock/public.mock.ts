import type { PickedUploadFile } from '@/types';

import type { PublicVerifyResponse } from '../public.api';

import { mockDelay } from './delay';

export const mockPublicApi = {
  async verifyDocument(file: PickedUploadFile): Promise<PublicVerifyResponse> {
    await mockDelay();

    return {
      status: 'MATCH',
      confidence: 0.98,
      file_name: file.name,
      notarized_at: 1778400000,
      notarized_by: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      tx_hash: '0x91a4d1b9c8f02c8be1f0d9d2e3a4b5c6d7e8f9012',
      matched_at: new Date().toISOString(),
    };
  },
};
