import type {
  AdminDashboardResponse,
  AdminUserListResponse,
  CreateInvitationRequest,
  InvitationListResponse,
  InvitationResponse,
} from '../admin.api';

import { mockDelay } from './delay';

let mockInvitations: InvitationResponse[] = [
  {
    id: 'd2802365-e134-4d83-9726-4db443211111',
    email: 'lawyer@example.com',
    role: 'lawyer',
    status: 'pending',
    expires_at: '2026-05-21T00:00:00Z',
    created_at: '2026-05-14T00:00:00Z',
    magic_link: 'https://lexchain.local/signup?token=mock-lawyer',
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

    const users = [
      {
        id: 'ec0a534a-693b-46c2-bde1-fd46c599f501',
        email: 'viewer@example.com',
        f_name: 'Demo',
        l_name: 'Viewer',
        role: 'viewer',
        is_active: true,
        created_at: '2026-05-01T00:00:00Z',
      },
      {
        id: 'a79d44a5-53f3-4734-8309-7a9c861adf9b',
        email: 'records@deped.gov.ph',
        f_name: 'DepEd',
        l_name: 'Records',
        role: 'lawyer',
        is_active: true,
        created_at: '2026-05-02T00:00:00Z',
      },
    ];

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

    const invitation: InvitationResponse = {
      id: `mock-invitation-${Date.now()}`,
      email: payload.email,
      role: payload.role ?? 'lawyer',
      status: 'pending',
      expires_at: '2026-05-21T00:00:00Z',
      created_at: new Date().toISOString(),
      magic_link: `https://lexchain.local/signup?email=${encodeURIComponent(payload.email)}`,
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
