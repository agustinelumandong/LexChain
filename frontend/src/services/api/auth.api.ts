import { apiClient } from './client';

import { env } from '@/shared/config';
import type { SupabaseUser } from '@/types';

import { mockAuthApi } from './mock';

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignInResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in: number;
  user: SupabaseUser;
};

export type SignUpPayload = {
  email: string;
  password: string;
  f_name: string;
  l_name: string;
  phone_number: string | null;
  token?: string;
};

export type SignUpResponse = {
  message: string;
  user_id: string;
  email: string;
  requires_email_confirmation: boolean;
};

export type ResendVerificationPayload = {
  email: string;
};

export type MessageResponse = {
  message: string;
};

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
