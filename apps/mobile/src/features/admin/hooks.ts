import {
  getAdminAnalytics,
  getAdminAuditLogs,
  getAdminBlockchainRecords,
  getAdminCategories,
  getAdminDocuments,
  getAdminIssuers,
  getAdminProcessingLogs,
  getAdminSettings,
  getAdminVerificationLogs,
} from './api';
import {
  useAdminDashboard,
  useAdminInvitationsApi,
  useAdminUsersApi,
} from '@/services/query';
import type {
  AdminDashboardResponse,
  AdminUserResponse,
  InvitationResponse,
} from '@/services/api';
import type { AdminInvitationLog, AdminRole, AdminStats, AdminUser } from './types';

type DemoQueryResult<T> = {
  data: T;
  error: null;
  isLoading: false;
};

function useDemoQuery<T>(data: T): DemoQueryResult<T> {
  return {
    data,
    error: null,
    isLoading: false,
  };
}

export function useAdminStats() {
  const dashboardQuery = useAdminDashboard();

  return {
    ...dashboardQuery,
    data: dashboardQuery.data ? mapDashboardStats(dashboardQuery.data) : undefined,
  };
}

export function useAdminUsers() {
  const usersQuery = useAdminUsersApi();

  return {
    ...usersQuery,
    data: usersQuery.data?.users.map(mapAdminUser),
  };
}

export function useAdminDocuments() {
  return useDemoQuery(getAdminDocuments());
}

export function useAdminVerificationLogs() {
  return useDemoQuery(getAdminVerificationLogs());
}

export function useAdminIssuers() {
  return useDemoQuery(getAdminIssuers());
}

export function useAdminCategories() {
  return useDemoQuery(getAdminCategories());
}

export function useAdminInvitations() {
  const invitationsQuery = useAdminInvitationsApi();

  return {
    ...invitationsQuery,
    data: invitationsQuery.data?.invitations.map(mapAdminInvitation),
  };
}

export function useAdminBlockchainRecords() {
  return useDemoQuery(getAdminBlockchainRecords());
}

export function useAdminProcessingLogs() {
  return useDemoQuery(getAdminProcessingLogs());
}

export function useAdminAnalytics() {
  return useDemoQuery(getAdminAnalytics());
}

export function useAdminAuditLogs() {
  return useDemoQuery(getAdminAuditLogs());
}

export function useAdminSettings() {
  return useDemoQuery(getAdminSettings());
}

function mapDashboardStats(stats: AdminDashboardResponse): AdminStats {
  return {
    total_users: stats.total_users,
    total_document_issuers: stats.total_lawyers,
    total_documents: stats.total_documents,
    processed_documents: stats.total_processed,
    pending_documents: stats.pending_invitations,
    failed_documents: stats.total_failed,
    total_verifications: stats.total_on_chain,
    tamper_alerts: stats.total_failed,
  };
}

function normalizeAdminRole(role: string): AdminRole {
  if (role === 'admin' || role === 'super_admin') {
    return 'super_admin';
  }

  if (role === 'lawyer' || role === 'document_issuer') {
    return 'document_issuer';
  }

  if (role === 'public_verifier') {
    return 'public_verifier';
  }

  return 'witness';
}

function mapAdminUser(user: AdminUserResponse): AdminUser {
  return {
    id: user.id,
    name: `${user.f_name} ${user.l_name}`.trim() || user.email,
    email: user.email,
    role: normalizeAdminRole(user.role),
    status: user.is_active ? 'active' : 'suspended',
    last_login_at: null,
    uploaded_documents: 0,
    verification_attempts: 0,
    created_at: user.created_at,
  };
}

function mapInvitationStatus(status: string): AdminInvitationLog['status'] {
  if (
    status === 'sent' ||
    status === 'accepted' ||
    status === 'expired' ||
    status === 'revoked'
  ) {
    return status;
  }

  if (status === 'pending') {
    return 'sent';
  }

  return 'sent';
}

function mapAdminInvitation(invitation: InvitationResponse): AdminInvitationLog {
  return {
    id: invitation.id,
    document_name: 'Account invitation',
    issuer: 'LexChain Super Admin',
    participant_email: invitation.email,
    permission_type:
      invitation.role === 'admin' ? 'view_download' : 'view_only',
    status: mapInvitationStatus(invitation.status),
    sent_at: invitation.created_at,
  };
}
