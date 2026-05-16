export type AdminRole =
  | 'document_issuer'
  | 'witness'
  | 'public_verifier'
  | 'super_admin';

export type AdminStats = {
  total_users: number;
  total_document_issuers: number;
  total_documents: number;
  processed_documents: number;
  pending_documents: number;
  failed_documents: number;
  total_verifications: number;
  tamper_alerts: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'suspended' | 'pending_email_verification';
  last_login_at: string | null;
  uploaded_documents: number;
  verification_attempts: number;
  created_at: string;
};

export type AdminDocument = {
  id: string;
  file_name: string;
  owner_name: string;
  category: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'verified' | 'tampered';
  file_type: string;
  privacy: 'confidential' | 'invite_only' | 'public_verification';
  ocr_status: 'queued' | 'complete' | 'failed';
  nlp_status: 'queued' | 'complete' | 'failed';
  blockchain_status: 'pending' | 'anchored' | 'failed';
  created_at: string;
};

export type AdminVerificationLog = {
  id: string;
  document_id: string;
  document_name: string;
  verification_code: string;
  verifier: string;
  status: 'authentic' | 'mismatch' | 'pending';
  blockchain_hash: string;
  verified_at: string | null;
};

export type AdminIssuer = {
  id: string;
  name: string;
  contact_email: string;
  organization_type: string;
  active_users: number;
  documents_uploaded: number;
  status: 'active' | 'under_review' | 'suspended';
};

export type AdminCategory = {
  id: string;
  name: string;
  publicly_verifiable: boolean;
  requires_invitation: boolean;
  allow_download: boolean;
  default_privacy: 'confidential' | 'invite_only' | 'public_verification';
};

export type AdminInvitationLog = {
  id: string;
  document_name: string;
  issuer: string;
  participant_email: string;
  permission_type: 'view_only' | 'view_download' | 'verify_only';
  status: 'sent' | 'accepted' | 'expired' | 'revoked';
  sent_at: string;
};

export type AdminBlockchainRecord = {
  id: string;
  document_hash: string;
  transaction_hash: string;
  block_number: number | null;
  network: string;
  status: 'anchored' | 'failed' | 'delayed';
  anchored_at: string | null;
};

export type AdminProcessingLog = {
  id: string;
  document_name: string;
  ocr_status: 'success' | 'failed' | 'low_confidence';
  nlp_status: 'generated' | 'failed' | 'needs_retry';
  extracted_data_status: string;
  processing_time: string;
  api_usage: string;
};

export type AdminAnalyticsMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type AdminAuditLog = {
  id: string;
  actor: string;
  action: string;
  target: string;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
};

export type AdminSystemSetting = {
  id: string;
  setting: string;
  value: string;
  scope: string;
};
