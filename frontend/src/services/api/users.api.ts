import type { components } from './generated/schema';

import { env } from '@/shared/config';

import { apiClient } from './client';
import { mockUsersApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type UserSearchResponse = ApiSchema<'UserSearchResponse'>;

export const usersApi = {
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
