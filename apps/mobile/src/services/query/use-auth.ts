import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearSessionData } from '@/features/auth/session-cleanup';
import {
  authApi,
  type MFALoginVerifyPayload,
  type MFAVerifyPayload,
  type SignInPayload,
  type SignInResponse,
  type SignUpPayload,
} from '@/services/api';
import { authTokenStorage, refreshTokenStorage } from '@/shared/utils/secure-storage';

import { queryKeys } from './keys';

async function persistSignInSession(
  data: SignInResponse,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  if (!data.access_token || !data.refresh_token || !data.user) {
    return;
  }

  await authTokenStorage.set(data.access_token);
  await refreshTokenStorage.set(data.refresh_token);
  queryClient.setQueryData(queryKeys.auth.currentUser, data.user);
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SignInPayload) => {
      await clearSessionData();

      return authApi.signIn(payload);
    },
    onSuccess: async (data) => {
      await persistSignInSession(data, queryClient);
    },
  });
}

export function useVerifyMfaSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MFALoginVerifyPayload) => authApi.verifyMfaSignIn(payload),
    onSuccess: async (data) => {
      await persistSignInSession(data, queryClient);
    },
  });
}

export function useSetupMfa() {
  return useMutation({
    mutationFn: authApi.setupMfa,
  });
}

export function useEnableMfa() {
  return useMutation({
    mutationFn: (payload: MFAVerifyPayload) => authApi.enableMfa(payload),
  });
}

export function useDisableMfa() {
  return useMutation({
    mutationFn: (payload: MFAVerifyPayload) => authApi.disableMfa(payload),
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
