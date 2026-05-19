import { useQuery } from '@tanstack/react-query';

import { usersApi } from '@/services/api';

import { queryKeys } from './keys';

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.users.profile,
    queryFn: usersApi.getProfile,
    retry: false,
  });
}

export function useUserSearch(email: string, enabled = true) {
  const trimmedEmail = email.trim();

  return useQuery({
    queryKey: queryKeys.users.search(trimmedEmail),
    queryFn: () => usersApi.searchByEmail(trimmedEmail),
    enabled: enabled && trimmedEmail.length > 0,
    retry: false,
  });
}
