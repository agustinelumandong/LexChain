import type {
  AdminDocument,
  AdminStats,
  AdminUser,
  AdminVerificationLog,
} from './types';

export const DEMO_ADMIN_STATS: AdminStats = {
  total_users: 128,
  total_documents: 342,
  total_verified_documents: 286,
  total_pending_documents: 41,
  total_failed_verifications: 15,
};

export const DEMO_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr_001',
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    role: 'user',
    status: 'active',
    created_at: '2026-04-12T10:20:00Z',
  },
  {
    id: 'usr_002',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    role: 'admin',
    status: 'active',
    created_at: '2026-04-18T13:45:00Z',
  },
  {
    id: 'usr_003',
    name: 'Ana Reyes',
    email: 'ana.reyes@example.com',
    role: 'user',
    status: 'pending',
    created_at: '2026-05-03T08:15:00Z',
  },
];

export const DEMO_ADMIN_DOCUMENTS: AdminDocument[] = [
  {
    id: 'doc_001',
    file_name: 'Memorandum of Agreement.pdf',
    owner_name: 'Maria Santos',
    status: 'verified',
    created_at: '2026-05-01T09:12:00Z',
  },
  {
    id: 'doc_002',
    file_name: 'Board Resolution.pdf',
    owner_name: 'Juan Dela Cruz',
    status: 'pending',
    created_at: '2026-05-05T11:30:00Z',
  },
  {
    id: 'doc_003',
    file_name: 'Service Contract.pdf',
    owner_name: 'Ana Reyes',
    status: 'failed',
    created_at: '2026-05-08T15:10:00Z',
  },
];

export const DEMO_ADMIN_VERIFICATION_LOGS: AdminVerificationLog[] = [
  {
    id: 'log_001',
    document_id: 'doc_001',
    verification_code: 'LEX-DEMO-2026',
    status: 'verified',
    verified_at: '2026-05-01T09:18:00Z',
  },
  {
    id: 'log_002',
    document_id: 'doc_002',
    verification_code: 'LEX-PENDING-018',
    status: 'pending',
    verified_at: null,
  },
  {
    id: 'log_003',
    document_id: 'doc_003',
    verification_code: 'LEX-FAILED-019',
    status: 'invalid',
    verified_at: '2026-05-08T15:19:00Z',
  },
];

export function getAdminStats() {
  return Promise.resolve(DEMO_ADMIN_STATS);
}

export function getAdminUsers() {
  return Promise.resolve(DEMO_ADMIN_USERS);
}

export function getAdminDocuments() {
  return Promise.resolve(DEMO_ADMIN_DOCUMENTS);
}

export function getAdminVerificationLogs() {
  return Promise.resolve(DEMO_ADMIN_VERIFICATION_LOGS);
}
