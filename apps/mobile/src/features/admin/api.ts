import type {
  AdminAnalyticsMetric,
  AdminAuditLog,
  AdminBlockchainRecord,
  AdminCategory,
  AdminDocument,
  AdminInvitationLog,
  AdminIssuer,
  AdminProcessingLog,
  AdminStats,
  AdminSystemSetting,
  AdminUser,
  AdminVerificationLog,
} from './types';

export const DEMO_ADMIN_STATS: AdminStats = {
  total_users: 120,
  total_document_issuers: 25,
  total_documents: 2340,
  processed_documents: 2100,
  pending_documents: 120,
  failed_documents: 30,
  total_verifications: 900,
  tamper_alerts: 5,
};

export const DEMO_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr_001',
    name: 'Atty. Maria Santos',
    email: 'maria.santos@davaolaw.ph',
    role: 'document_issuer',
    status: 'active',
    last_login_at: '2026-05-13T08:42:00Z',
    uploaded_documents: 148,
    verification_attempts: 6,
    created_at: '2026-04-12T10:20:00Z',
  },
  {
    id: 'usr_002',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    role: 'public_verifier',
    status: 'active',
    last_login_at: '2026-05-12T13:45:00Z',
    uploaded_documents: 0,
    verification_attempts: 24,
    created_at: '2026-04-18T13:45:00Z',
  },
  {
    id: 'usr_003',
    name: 'Ana Reyes',
    email: 'ana.reyes@example.com',
    role: 'witness',
    status: 'pending_email_verification',
    last_login_at: null,
    uploaded_documents: 0,
    verification_attempts: 1,
    created_at: '2026-05-03T08:15:00Z',
  },
  {
    id: 'usr_004',
    name: 'LexChain Owner',
    email: 'owner@lexchain.local',
    role: 'super_admin',
    status: 'active',
    last_login_at: '2026-05-13T15:24:00Z',
    uploaded_documents: 0,
    verification_attempts: 0,
    created_at: '2026-03-01T09:00:00Z',
  },
];

export const DEMO_ADMIN_DOCUMENTS: AdminDocument[] = [
  {
    id: 'doc_001',
    file_name: 'Deed of Sale - Lot 18.pdf',
    owner_name: 'Santos & Cruz Law Office',
    category: 'Deed of Sale',
    status: 'verified',
    file_type: 'PDF',
    privacy: 'public_verification',
    ocr_status: 'complete',
    nlp_status: 'complete',
    blockchain_status: 'anchored',
    created_at: '2026-05-01T09:12:00Z',
  },
  {
    id: 'doc_002',
    file_name: 'Service Contract - Redacted.pdf',
    owner_name: 'Davao Business Hub',
    category: 'Contract',
    status: 'processing',
    file_type: 'PDF',
    privacy: 'invite_only',
    ocr_status: 'complete',
    nlp_status: 'queued',
    blockchain_status: 'pending',
    created_at: '2026-05-05T11:30:00Z',
  },
  {
    id: 'doc_003',
    file_name: 'Barangay Resolution 2026-14.pdf',
    owner_name: 'Barangay Matina Office',
    category: 'Barangay Resolution',
    status: 'failed',
    file_type: 'PDF',
    privacy: 'public_verification',
    ocr_status: 'failed',
    nlp_status: 'queued',
    blockchain_status: 'failed',
    created_at: '2026-05-08T15:10:00Z',
  },
  {
    id: 'doc_004',
    file_name: 'Lease Agreement - Unit 4B.pdf',
    owner_name: 'Mindanao Property Group',
    category: 'Lease Agreement',
    status: 'tampered',
    file_type: 'PDF',
    privacy: 'confidential',
    ocr_status: 'complete',
    nlp_status: 'complete',
    blockchain_status: 'anchored',
    created_at: '2026-05-10T14:05:00Z',
  },
];

export const DEMO_ADMIN_VERIFICATION_LOGS: AdminVerificationLog[] = [
  {
    id: 'log_001',
    document_id: 'doc_001',
    document_name: 'Deed of Sale - Lot 18.pdf',
    verification_code: 'LEX-DEMO-2026',
    verifier: 'juan.delacruz@example.com',
    status: 'authentic',
    blockchain_hash: '0x91a4...f02c',
    verified_at: '2026-05-01T09:18:00Z',
  },
  {
    id: 'log_002',
    document_id: 'doc_002',
    document_name: 'Service Contract - Redacted.pdf',
    verification_code: 'LEX-PENDING-018',
    verifier: 'public.portal@visitor.local',
    status: 'pending',
    blockchain_hash: 'Pending anchoring',
    verified_at: null,
  },
  {
    id: 'log_003',
    document_id: 'doc_003',
    document_name: 'Barangay Resolution 2026-14.pdf',
    verification_code: 'LEX-FAILED-019',
    verifier: 'records.audit@example.com',
    status: 'mismatch',
    blockchain_hash: '0x20af...9db1',
    verified_at: '2026-05-08T15:19:00Z',
  },
];

export const DEMO_ADMIN_ISSUERS: AdminIssuer[] = [
  {
    id: 'iss_001',
    name: 'Santos & Cruz Law Office',
    contact_email: 'records@davaolaw.ph',
    organization_type: 'Law Firm',
    active_users: 8,
    documents_uploaded: 486,
    status: 'active',
  },
  {
    id: 'iss_002',
    name: 'Barangay Matina Office',
    contact_email: 'secretariat@matina.gov.ph',
    organization_type: 'Government Office',
    active_users: 4,
    documents_uploaded: 134,
    status: 'under_review',
  },
  {
    id: 'iss_003',
    name: 'Mindanao Property Group',
    contact_email: 'legal@mpg.example',
    organization_type: 'Private Office',
    active_users: 5,
    documents_uploaded: 211,
    status: 'active',
  },
];

export const DEMO_ADMIN_CATEGORIES: AdminCategory[] = [
  { id: 'cat_001', name: 'Deed of Sale', publicly_verifiable: true, requires_invitation: false, allow_download: true, default_privacy: 'public_verification' },
  { id: 'cat_002', name: 'Contract', publicly_verifiable: false, requires_invitation: true, allow_download: false, default_privacy: 'confidential' },
  { id: 'cat_003', name: 'Affidavit', publicly_verifiable: true, requires_invitation: false, allow_download: true, default_privacy: 'public_verification' },
  { id: 'cat_004', name: 'Agreement', publicly_verifiable: false, requires_invitation: true, allow_download: false, default_privacy: 'invite_only' },
  { id: 'cat_005', name: 'Certificate', publicly_verifiable: true, requires_invitation: false, allow_download: true, default_privacy: 'public_verification' },
  { id: 'cat_006', name: 'Lease Agreement', publicly_verifiable: false, requires_invitation: true, allow_download: false, default_privacy: 'confidential' },
  { id: 'cat_007', name: 'Employment Contract', publicly_verifiable: false, requires_invitation: true, allow_download: false, default_privacy: 'confidential' },
  { id: 'cat_008', name: 'Memorandum', publicly_verifiable: false, requires_invitation: true, allow_download: true, default_privacy: 'invite_only' },
  { id: 'cat_009', name: 'Barangay Resolution', publicly_verifiable: true, requires_invitation: false, allow_download: true, default_privacy: 'public_verification' },
  { id: 'cat_010', name: 'Others', publicly_verifiable: false, requires_invitation: true, allow_download: false, default_privacy: 'confidential' },
];

export const DEMO_ADMIN_INVITATIONS: AdminInvitationLog[] = [
  {
    id: 'inv_001',
    document_name: 'Service Contract - Redacted.pdf',
    issuer: 'Davao Business Hub',
    participant_email: 'client@example.com',
    permission_type: 'view_only',
    status: 'accepted',
    sent_at: '2026-05-05T12:00:00Z',
  },
  {
    id: 'inv_002',
    document_name: 'Lease Agreement - Unit 4B.pdf',
    issuer: 'Mindanao Property Group',
    participant_email: 'tenant@example.com',
    permission_type: 'view_download',
    status: 'sent',
    sent_at: '2026-05-10T14:25:00Z',
  },
  {
    id: 'inv_003',
    document_name: 'Employment Contract - Batch A.pdf',
    issuer: 'Santos & Cruz Law Office',
    participant_email: 'pending-user@example.com',
    permission_type: 'verify_only',
    status: 'expired',
    sent_at: '2026-04-28T09:10:00Z',
  },
];

export const DEMO_ADMIN_BLOCKCHAIN_RECORDS: AdminBlockchainRecord[] = [
  {
    id: 'bc_001',
    document_hash: '0x91a4d1b9c8f02c',
    transaction_hash: '0xabc4410e228fd90',
    block_number: 8420011,
    network: 'Polygon Amoy Testnet',
    status: 'anchored',
    anchored_at: '2026-05-01T09:16:00Z',
  },
  {
    id: 'bc_002',
    document_hash: '0x20af78ce139db1',
    transaction_hash: '0xdeb9910a771ce00',
    block_number: 8420188,
    network: 'Polygon Amoy Testnet',
    status: 'anchored',
    anchored_at: '2026-05-08T15:14:00Z',
  },
  {
    id: 'bc_003',
    document_hash: '0xf01c8842aa901b',
    transaction_hash: 'Retry queued',
    block_number: null,
    network: 'Polygon Amoy Testnet',
    status: 'failed',
    anchored_at: null,
  },
];

export const DEMO_ADMIN_PROCESSING_LOGS: AdminProcessingLog[] = [
  {
    id: 'proc_001',
    document_name: 'Deed of Sale - Lot 18.pdf',
    ocr_status: 'success',
    nlp_status: 'generated',
    extracted_data_status: 'Parties, dates, property details, obligations',
    processing_time: '41s',
    api_usage: '1 OCR job, 1 summary job',
  },
  {
    id: 'proc_002',
    document_name: 'Barangay Resolution 2026-14.pdf',
    ocr_status: 'failed',
    nlp_status: 'needs_retry',
    extracted_data_status: 'Unreadable scan pages 2-3',
    processing_time: '12s',
    api_usage: '1 OCR retry queued',
  },
  {
    id: 'proc_003',
    document_name: 'Lease Agreement - Unit 4B.pdf',
    ocr_status: 'low_confidence',
    nlp_status: 'generated',
    extracted_data_status: 'Parties and dates extracted; clauses need review',
    processing_time: '58s',
    api_usage: '1 OCR job, 1 summary job',
  },
];

export const DEMO_ADMIN_ANALYTICS: AdminAnalyticsMetric[] = [
  { id: 'an_001', label: 'Documents processed this month', value: '500', detail: 'Up 18% from last month' },
  { id: 'an_002', label: 'Most used category', value: 'Deed of Sale', detail: '31% of uploaded documents' },
  { id: 'an_003', label: 'Verification success', value: '95%', detail: '5% mismatch or inconclusive' },
  { id: 'an_004', label: 'OCR/NLP failure rate', value: '3%', detail: 'Mostly low-quality scans' },
  { id: 'an_005', label: 'Active issuers', value: '20', detail: 'Offices active in the last 30 days' },
  { id: 'an_006', label: 'Storage usage', value: '8 GB', detail: 'Across issuer document storage' },
  { id: 'an_007', label: 'Anchoring success rate', value: '98%', detail: '2% delayed or retrying' },
];

export const DEMO_ADMIN_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'aud_001',
    actor: 'owner@lexchain.local',
    action: 'Changed category privacy rule',
    target: 'Contract',
    severity: 'info',
    created_at: '2026-05-13T10:20:00Z',
  },
  {
    id: 'aud_002',
    actor: 'records.audit@example.com',
    action: 'Verified document and received mismatch result',
    target: 'doc_003',
    severity: 'critical',
    created_at: '2026-05-08T15:19:00Z',
  },
  {
    id: 'aud_003',
    actor: 'client@example.com',
    action: 'Accepted invitation',
    target: 'Service Contract - Redacted.pdf',
    severity: 'info',
    created_at: '2026-05-05T13:02:00Z',
  },
  {
    id: 'aud_004',
    actor: 'unknown visitor',
    action: 'Too many failed verification attempts',
    target: 'Public verification portal',
    severity: 'warning',
    created_at: '2026-05-12T21:33:00Z',
  },
];

export const DEMO_ADMIN_SETTINGS: AdminSystemSetting[] = [
  { id: 'set_001', setting: 'Allowed file types', value: 'PDF, DOCX, TXT', scope: 'Upload rules' },
  { id: 'set_002', setting: 'Max file size', value: '10MB', scope: 'Upload rules' },
  { id: 'set_003', setting: 'OCR preprocessing', value: 'Enabled', scope: 'OCR settings' },
  { id: 'set_004', setting: 'NLP provider', value: 'Demo AI provider', scope: 'NLP/API settings' },
  { id: 'set_005', setting: 'Blockchain network', value: 'Polygon Amoy Testnet', scope: 'Blockchain' },
  { id: 'set_006', setting: 'Verification rule', value: 'Category-based public or invite-only', scope: 'Verification' },
  { id: 'set_007', setting: 'Invite expiration', value: '7 days', scope: 'Email invitations' },
  { id: 'set_008', setting: 'Per issuer storage limit', value: '25GB', scope: 'Storage' },
  { id: 'set_009', setting: 'Maintenance mode', value: 'Off', scope: 'System availability' },
];

export function getAdminStats() {
  return DEMO_ADMIN_STATS;
}

export function getAdminUsers() {
  return DEMO_ADMIN_USERS;
}

export function getAdminDocuments() {
  return DEMO_ADMIN_DOCUMENTS;
}

export function getAdminVerificationLogs() {
  return DEMO_ADMIN_VERIFICATION_LOGS;
}

export function getAdminIssuers() {
  return DEMO_ADMIN_ISSUERS;
}

export function getAdminCategories() {
  return DEMO_ADMIN_CATEGORIES;
}

export function getAdminInvitations() {
  return DEMO_ADMIN_INVITATIONS;
}

export function getAdminBlockchainRecords() {
  return DEMO_ADMIN_BLOCKCHAIN_RECORDS;
}

export function getAdminProcessingLogs() {
  return DEMO_ADMIN_PROCESSING_LOGS;
}

export function getAdminAnalytics() {
  return DEMO_ADMIN_ANALYTICS;
}

export function getAdminAuditLogs() {
  return DEMO_ADMIN_AUDIT_LOGS;
}

export function getAdminSettings() {
  return DEMO_ADMIN_SETTINGS;
}
