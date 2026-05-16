import type { PublicVerificationResult } from './types';

// TODO: Backend endpoint GET /public/verify/{code} is not yet implemented.
// Replace this stub with a real apiClient call when the endpoint is available.
export async function verifyDocumentByCode(
  _code: string,
): Promise<PublicVerificationResult> {
  throw new Error('NOT_IMPLEMENTED');
}
