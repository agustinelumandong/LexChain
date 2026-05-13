export type PublicVerificationStatus =
  | 'verified'
  | 'invalid'
  | 'expired'
  | 'revoked'
  | 'pending';

export type PublicVerificationResult = {
  verification_code: string;
  status: PublicVerificationStatus;
  file_name: string;
  document_hash?: string | null;
  uploaded_at?: string | null;
  verified_at?: string | null;
  owner_display_name?: string | null;
  message?: string | null;
};
