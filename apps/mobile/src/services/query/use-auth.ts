import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearSessionData } from '@/features/auth/session-cleanup';
import { authApi, type SignInPayload, type SignUpPayload } from '@/services/api';
import { authTokenStorage, refreshTokenStorage } from '@/shared/utils/secure-storage';

import { queryKeys } from './keys';

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SignInPayload) => {
      await clearSessionData();

      return authApi.signIn(payload);
    },
    onSuccess: async (data) => {
      await authTokenStorage.set(data.access_token);
      await refreshTokenStorage.set(data.refresh_token);
      queryClient.setQueryData(queryKeys.auth.currentUser, data.user);
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (payload: SignUpPayload) => authApi.signUp(payload),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: authApi.resendVerification,
  });
}
