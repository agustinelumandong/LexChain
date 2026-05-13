export type AdminRole = 'user' | 'admin' | 'super_admin';

export type AdminStats = {
  total_users: number;
  total_documents: number;
  total_verified_documents: number;
  total_pending_documents: number;
  total_failed_verifications: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: string;
  created_at: string;
};

export type AdminDocument = {
  id: string;
  file_name: string;
  owner_name: string;
  status: string;
  created_at: string;
};

export type AdminVerificationLog = {
  id: string;
  document_id: string;
  verification_code: string;
  status: string;
  verified_at: string | null;
};
