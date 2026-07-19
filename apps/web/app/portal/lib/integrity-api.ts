import type { components } from '@lexchain/types';

type OnChainVerification = components['schemas']['OnChainVerificationResponse'];

async function integrityFetch<T>(path: string, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json() as Promise<T>;
}

export function verifyRepositoryDocument(documentId: string) {
  return integrityFetch<OnChainVerification>(`/api/portal/blockchain/verify/${documentId}`);
}
