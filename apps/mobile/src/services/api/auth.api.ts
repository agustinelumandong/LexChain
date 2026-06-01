import { apiClient } from './client';
import type { components } from '@lexchain/types/openapi';

import { env } from '@/shared/config';
import type { SupabaseUser } from '@/types';

import { mockAuthApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type SignInPayload = ApiSchema<'SignInRequest'>;

export type SignInResponse = Omit<ApiSchema<'SignInResponse'>, 'user'> & {
  user?: SupabaseUser | null;
};

export type MFALoginVerifyPayload = ApiSchema<'MFALoginVerifyRequest'>;

export type MFAVerifyPayload = ApiSchema<'MFAVerifyRequest'>;

export type MFASetupResponse = ApiSchema<'MFASetupResponse'>;

export type SignUpPayload = ApiSchema<'SignUpRequest'> & {
  token?: string;
};

export type SignUpResponse = ApiSchema<'SignUpResponse'>;

export type ResendVerificationPayload = ApiSchema<'ResendVerificationRequest'>;

export type MessageResponse = ApiSchema<'MessageResponse'>;

export const authApi = {
  signIn: (payload: SignInPayload) => {
    if (env.useMockApi) {
      return mockAuthApi.signIn(payload);
    }

    return apiClient.post<SignInResponse>('/auth/signin', payload, { auth: false });
  },

  signUp: (payload: SignUpPayload) => {
    if (env.useMockApi) {
      return mockAuthApi.signUp(payload);
    }

    return apiClient.post<SignUpResponse>('/auth/signup', payload, { auth: false });
  },

  resendVerification: (payload: ResendVerificationPayload) => {
    if (env.useMockApi) {
      return mockAuthApi.resendVerification(payload);
    }

    return apiClient.post<MessageResponse>('/auth/resend-verification', payload, { auth: false });
  },

  setupMfa: () => {
    if (env.useMockApi) {
      return mockAuthApi.setupMfa();
    }

    return apiClient.post<MFASetupResponse>('/auth/mfa/setup');
  },

  enableMfa: (payload: MFAVerifyPayload) => {
    if (env.useMockApi) {
      return mockAuthApi.enableMfa(payload);
    }

    return apiClient.post<MessageResponse>('/auth/mfa/verify-enable', payload);
  },

  disableMfa: (payload: MFAVerifyPayload) => {
    if (env.useMockApi) {
      return mockAuthApi.disableMfa(payload);
    }

    return apiClient.post<MessageResponse>('/auth/mfa/disable', payload);
  },

  verifyMfaSignIn: (payload: MFALoginVerifyPayload) => {
    if (env.useMockApi) {
      return mockAuthApi.verifyMfaSignIn(payload);
    }

    return apiClient.post<SignInResponse>('/auth/mfa/verify-signin', payload, {
      auth: false,
    });
  },
};
