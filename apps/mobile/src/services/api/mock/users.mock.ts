import type { UserProfileResponse, UserSearchResponse } from '../users.api';

import { authTokenStorage } from '@/shared/utils/secure-storage';

import {
  findMockAccountById,
  getMockAccountIdFromToken,
  MOCK_ACCOUNTS,
} from './accounts';
import { mockDelay } from './delay';

const MOCK_USERS: UserSearchResponse[] = [
  ...MOCK_ACCOUNTS.map((account) => ({
    user_id: account.id,
    email: account.email,
    f_name: account.f_name,
    l_name: account.l_name,
  })),
];

export const mockUsersApi = {
  async getProfile(): Promise<UserProfileResponse> {
    await mockDelay();

    const token = await authTokenStorage.get();
    const account = findMockAccountById(getMockAccountIdFromToken(token));

    return {
      email: account.email,
      f_name: account.f_name,
      l_name: account.l_name,
      avatar: account.avatar,
      role: account.role,
      mfa_enabled: false,
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
