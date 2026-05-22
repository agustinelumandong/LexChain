import type { UserProfileResponse, UserSearchResponse } from '../users.api';

import { mockDelay } from './delay';

const MOCK_USERS: UserSearchResponse[] = [
  {
    user_id: 'ec0a534a-693b-46c2-bde1-fd46c599f501',
    email: 'viewer@example.com',
    f_name: 'Demo',
    l_name: 'Viewer',
  },
  {
    user_id: 'a79d44a5-53f3-4734-8309-7a9c861adf9b',
    email: 'records@deped.gov.ph',
    f_name: 'DepEd',
    l_name: 'Records',
  },
  {
    user_id: 'bbba7496-a0f2-4510-aaac-9c234a52101c',
    email: 'legal@lexchain.app',
    f_name: 'Legal',
    l_name: 'Review',
  },
];

export const mockUsersApi = {
  async getProfile(): Promise<UserProfileResponse> {
    await mockDelay();

    return {
      email: 'atty.reyes@lexchain.app',
      f_name: 'Atty.',
      l_name: 'Reyes',
      avatar: 'icon-1',
      role: 'lawyer',
    };
  },

  async searchByEmail(email: string): Promise<UserSearchResponse> {
    await mockDelay();

    const normalizedEmail = email.trim().toLowerCase();
    const user = MOCK_USERS.find((entry) => entry.email === normalizedEmail);

    if (user) {
      return user;
    }

    return {
      user_id: `mock-user-${normalizedEmail}`,
      email: normalizedEmail,
      f_name: 'Invited',
      l_name: 'User',
    };
  },
};
