import {
  MOCK_RESEND_VERIFICATION_RESPONSE,
  MOCK_SIGN_UP_RESPONSE,
} from './data/auth';

import type {
  MessageResponse,
  ResendVerificationPayload,
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
} from '../auth.api';

import { mockDelay } from './delay';

export const mockAuthApi = {
  async signIn(payload: SignInPayload): Promise<SignInResponse> {
    await mockDelay();

    return {
      access_token: `mock-access-token-${Date.now()}`,
      refresh_token: `mock-refresh-token-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 'mock-user-1',
        email: payload.email,
        role: 'authenticated',
        user_metadata: {
          f_name: 'LexChain',
          l_name: 'User',
        },
      },
    };
  },

  async signUp(payload: SignUpPayload): Promise<SignUpResponse> {
    await mockDelay();

    return {
      ...MOCK_SIGN_UP_RESPONSE,
      email: payload.email,
      user_id: `mock-user-${payload.email.toLowerCase()}`,
      message: 'Mock account created. You can sign in now.',
      requires_email_confirmation: false,
    };
  },

  async resendVerification(
    _payload: ResendVerificationPayload,
  ): Promise<MessageResponse> {
    await mockDelay();

    return MOCK_RESEND_VERIFICATION_RESPONSE;
  },
};
