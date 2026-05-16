import { apiClient } from './client';
import type { components } from '@lexchain/types/openapi';

import { env } from '@/shared/config';
import type { SupabaseUser } from '@/types';

import { mockAuthApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type SignInPayload = ApiSchema<'SignInRequest'>;

export type SignInResponse = Omit<ApiSchema<'SignInResponse'>, 'user'> & {
  user: SupabaseUser;
};

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
};
