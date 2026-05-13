import type { PublicVerificationResult } from './types';

const DEMO_RESULTS: Record<string, PublicVerificationResult> = {
  'LEX-DEMO-2026': {
    verification_code: 'LEX-DEMO-2026',
    status: 'verified',
    file_name: 'Memorandum of Agreement.pdf',
    document_hash: '0x8f4c2a9d61b7e5c3f09a4d8b2e7c5a1f93d6b8c0e4a2f7d1c9b5a6e3f8d2c1b0',
    uploaded_at: '2026-05-01T09:12:00Z',
    verified_at: '2026-05-01T09:18:00Z',
    owner_display_name: 'LexChain Demo Office',
    message: 'Document verification record is valid for presentation preview.',
  },
};

function buildDemoResult(code: string): PublicVerificationResult {
  const normalizedCode = code.trim() || 'UNKNOWN';

  return (
    DEMO_RESULTS[normalizedCode.toUpperCase()] ?? {
      verification_code: normalizedCode,
      status: 'pending',
      file_name: 'Presentation sample document.pdf',
      document_hash: '0x5d8f0c3a9b2e7f641c0a3e9d5b7c2a1f6e8d4c9b0a7e3f2c1d6b5a8e9f0c4d2',
      uploaded_at: '2026-05-10T08:30:00Z',
      verified_at: null,
      owner_display_name: 'LexChain Demo User',
      message: 'Backend endpoint is not connected yet. This is a frontend-ready preview.',
    }
  );
}

export async function verifyDocumentByCode(code: string): Promise<PublicVerificationResult> {
  return buildDemoResult(code);
}

export function getDemoPublicVerification(code: string): PublicVerificationResult {
  return buildDemoResult(code);
}
