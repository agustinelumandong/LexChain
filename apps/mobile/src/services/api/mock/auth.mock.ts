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
import { authTokenStorage } from '@/shared/utils/secure-storage';

import {
  createMockAccessToken,
  createMockMfaToken,
  findMockAccountByEmail,
  findMockAccountById,
  getMockAccountIdFromMfaToken,
  getMockAccountIdFromToken,
  getMockMfaEnabled,
  setMockMfaEnabled,
} from './accounts';

const isValidTotpCode = (code: string) => /^\d{6}$/.test(code.trim());

async function getSignedInMockAccountId() {
  const token = await authTokenStorage.get();

  return getMockAccountIdFromToken(token);
}

export const mockAuthApi = {
  async signIn(payload: SignInPayload): Promise<SignInResponse> {
    await mockDelay();

    const account = findMockAccountByEmail(payload.email);

    if (getMockMfaEnabled(account.id)) {
      return {
        token_type: 'bearer',
        expires_in: 300,
        mfa_required: true,
        mfa_token: createMockMfaToken(account),
        user: null,
      };
    }

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

    const account = findMockAccountById(await getSignedInMockAccountId());

    return {
      secret: 'MOCKLEXCHAINMFA',
      provisioning_uri:
        `otpauth://totp/LexChain:${encodeURIComponent(account.email)}?secret=MOCKLEXCHAINMFA&issuer=LexChain`,
    };
  },

  async enableMfa(payload: MFAVerifyPayload): Promise<MessageResponse> {
    await mockDelay();

    if (!isValidTotpCode(payload.code)) {
      throw new Error('Enter a valid 6-digit authenticator code');
    }

    setMockMfaEnabled(await getSignedInMockAccountId(), true);

    return { message: 'MFA enabled' };
  },

  async disableMfa(payload: MFAVerifyPayload): Promise<MessageResponse> {
    await mockDelay();

    if (!isValidTotpCode(payload.code)) {
      throw new Error('Enter a valid 6-digit authenticator code');
    }

    setMockMfaEnabled(await getSignedInMockAccountId(), false);

    return { message: 'MFA disabled' };
  },

  async verifyMfaSignIn(payload: MFALoginVerifyPayload): Promise<SignInResponse> {
    await mockDelay();

    if (!isValidTotpCode(payload.code)) {
      throw new Error('Enter a valid 6-digit authenticator code');
    }

    const accountId = getMockAccountIdFromMfaToken(payload.mfa_token);

    if (!accountId) {
      throw new Error('MFA verification token is invalid');
    }

    const account = findMockAccountById(accountId);

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
