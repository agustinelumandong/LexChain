import {
  MOCK_RESEND_VERIFICATION_RESPONSE,
  MOCK_SIGN_UP_RESPONSE,
} from './data/auth';

import type {
  MFALoginVerifyPayload,
  MFASetupResponse,
  MFAVerifyPayload,
  MessageResponse,
  ResendVerificationPayload,
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
} from '../auth.api';

import { mockDelay } from './delay';
import { createMockAccessToken, findMockAccountByEmail } from './accounts';

export const mockAuthApi = {
  async signIn(payload: SignInPayload): Promise<SignInResponse> {
    await mockDelay();

    const account = findMockAccountByEmail(payload.email);

    return {
      access_token: createMockAccessToken(account),
      refresh_token: `mock-refresh-token-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      mfa_required: false,
      mfa_token: null,
      user: {
        id: account.id,
        email: account.email,
        role: 'authenticated',
        user_metadata: {
          f_name: account.f_name,
          l_name: account.l_name,
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

  async setupMfa(): Promise<MFASetupResponse> {
    await mockDelay();

    return {
      secret: 'MOCKLEXCHAINMFA',
      provisioning_uri:
        'otpauth://totp/LexChain:mock@example.com?secret=MOCKLEXCHAINMFA&issuer=LexChain',
    };
  },

  async enableMfa(_payload: MFAVerifyPayload): Promise<MessageResponse> {
    await mockDelay();

    return { message: 'MFA enabled' };
  },

  async disableMfa(_payload: MFAVerifyPayload): Promise<MessageResponse> {
    await mockDelay();

    return { message: 'MFA disabled' };
  },

  async verifyMfaSignIn(payload: MFALoginVerifyPayload): Promise<SignInResponse> {
    await mockDelay();

    const account = findMockAccountByEmail('lawyer@lexchain.test');

    return {
      access_token: createMockAccessToken(account),
      refresh_token: `mock-refresh-token-${payload.mfa_token}-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: account.id,
        email: account.email,
        role: 'authenticated',
        user_metadata: {
          f_name: account.f_name,
          l_name: account.l_name,
        },
      },
      mfa_required: false,
      mfa_token: null,
    };
  },
};
