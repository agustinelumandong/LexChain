import type { components } from '@lexchain/types/openapi';

import { env } from '@/shared/config';

import { apiClient } from './client';
import { mockUsersApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type UserSearchResponse = ApiSchema<'UserSearchResponse'>;
export type UserProfileResponse = ApiSchema<'UserProfileResponse'>;

export const usersApi = {
  getProfile: () => {
    if (env.useMockApi) {
      return mockUsersApi.getProfile();
    }

    return apiClient.get<UserProfileResponse>('/users/');
  },

  searchByEmail: (email: string) => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      throw new Error('email is required');
    }

    if (env.useMockApi) {
      return mockUsersApi.searchByEmail(trimmedEmail);
    }

    const searchParams = new URLSearchParams({ email: trimmedEmail });

    return apiClient.get<UserSearchResponse>(
      `/users/search?${searchParams.toString()}`,
    );
  },
};
