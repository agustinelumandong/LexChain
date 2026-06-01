import type {
  AdminDashboardResponse,
  AdminUserResponse,
  AdminUserListResponse,
  CreateInvitationRequest,
  InvitationListResponse,
  InvitationResponse,
} from '../admin.api';

import { mockDelay } from './delay';
import { MOCK_ACCOUNTS } from './accounts';

let mockInvitations: InvitationResponse[] = [
  {
    id: 'd2802365-e134-4d83-9726-4db443211111',
    email: 'lawyer@example.com',
    role: 'lawyer',
    status: 'pending',
    expires_at: '2026-05-21T00:00:00Z',
    created_at: '2026-05-14T00:00:00Z',
    magic_link: 'https://lexchain.local/invite/mock-lawyer',
  },
];

export const mockAdminApi = {
  async getDashboard(): Promise<AdminDashboardResponse> {
    await mockDelay();

    return {
      total_users: 120,
      total_lawyers: 25,
      total_documents: 2340,
      total_processed: 2100,
      total_failed: 30,
      total_on_chain: 900,
      pending_invitations: mockInvitations.filter(
        (invitation) => invitation.status === 'pending',
      ).length,
    };
  },

  async getUsers(): Promise<AdminUserListResponse> {
    await mockDelay();

    const users: AdminUserResponse[] = MOCK_ACCOUNTS.map((account, index) => ({
      id: account.id,
      email: account.email,
      f_name: account.f_name,
      l_name: account.l_name,
      role: account.role,
      is_active: true,
      created_at: `2026-05-0${index + 1}T00:00:00Z`,
    }));

    return {
      users,
      total: users.length,
    };
  },

  async getInvitations(): Promise<InvitationListResponse> {
    await mockDelay();

    return {
      invitations: mockInvitations,
    };
  },

  async createInvitation(
    payload: CreateInvitationRequest,
  ): Promise<InvitationResponse> {
    await mockDelay();

    const invitationId = `mock-invitation-${Date.now()}`;
    const invitation: InvitationResponse = {
      id: invitationId,
      email: payload.email,
      role: payload.role ?? 'lawyer',
      status: 'pending',
      expires_at: '2026-05-21T00:00:00Z',
      created_at: new Date().toISOString(),
      magic_link: `https://lexchain.local/invite/${encodeURIComponent(invitationId)}`,
    };

    mockInvitations = [invitation, ...mockInvitations];

    return invitation;
  },

  async revokeInvitation(invitationId: string): Promise<void> {
    await mockDelay();

    mockInvitations = mockInvitations.filter(
      (invitation) => invitation.id !== invitationId,
    );
  },
};
