import type { components } from './generated/schema';

import { env } from '@/shared/config';

import { apiClient } from './client';
import { mockAdminApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type AdminDashboardResponse = ApiSchema<'AdminDashboardResponse'>;
export type AdminUserResponse = ApiSchema<'AdminUserResponse'>;
export type AdminUserListResponse = ApiSchema<'AdminUserListResponse'>;
export type CreateInvitationRequest = Omit<
  ApiSchema<'CreateInvitationRequest'>,
  'role'
> & {
  role?: ApiSchema<'CreateInvitationRequest'>['role'];
};
export type InvitationResponse = ApiSchema<'InvitationResponse'>;
export type InvitationListResponse = ApiSchema<'InvitationListResponse'>;

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
