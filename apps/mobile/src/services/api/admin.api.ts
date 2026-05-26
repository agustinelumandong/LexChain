import type { components } from '@lexchain/types/openapi';

import { env } from '@/shared/config';

import { apiClient } from './client';
import { mockAdminApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type UserPositionRole = 'user' | 'lawyer';
export type AccountRole = 'admin' | UserPositionRole;
export type InvitationRole = 'admin' | 'lawyer';

export type AdminDashboardResponse = ApiSchema<'AdminDashboardResponse'>;
export type AdminUserResponse = Omit<ApiSchema<'AdminUserResponse'>, 'role'> & {
  role: AccountRole;
};
export type AdminUserListResponse = Omit<
  ApiSchema<'AdminUserListResponse'>,
  'users'
> & {
  users: AdminUserResponse[];
};
export type CreateInvitationRequest = Omit<
  ApiSchema<'CreateInvitationRequest'>,
  'role'
> & {
  role?: InvitationRole;
};
export type InvitationResponse = Omit<ApiSchema<'InvitationResponse'>, 'role'> & {
  role: InvitationRole;
};
export type InvitationListResponse = Omit<
  ApiSchema<'InvitationListResponse'>,
  'invitations'
> & {
  invitations: InvitationResponse[];
};

const encodeId = (value: string, label: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${label} is required`);
  }

  return encodeURIComponent(trimmed);
};

export const adminApi = {
  getDashboard: () => {
    if (env.useMockApi) {
      return mockAdminApi.getDashboard();
    }

    return apiClient.get<AdminDashboardResponse>('/admin/dashboard');
  },

  getUsers: () => {
    if (env.useMockApi) {
      return mockAdminApi.getUsers();
    }

    return apiClient.get<AdminUserListResponse>('/admin/users');
  },

  getInvitations: () => {
    if (env.useMockApi) {
      return mockAdminApi.getInvitations();
    }

    return apiClient.get<InvitationListResponse>('/admin/invitations');
  },

  createInvitation: (payload: CreateInvitationRequest) => {
    if (env.useMockApi) {
      return mockAdminApi.createInvitation(payload);
    }

    return apiClient.post<InvitationResponse>('/admin/invitations', payload);
  },

  revokeInvitation: (invitationId: string) => {
    const encodedInvitationId = encodeId(invitationId, 'invitationId');

    if (env.useMockApi) {
      return mockAdminApi.revokeInvitation(invitationId);
    }

    return apiClient.delete<void>(`/admin/invitations/${encodedInvitationId}`);
  },
};
