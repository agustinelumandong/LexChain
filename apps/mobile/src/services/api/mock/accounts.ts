export type MockAccountRole = 'admin' | 'lawyer' | 'user';

export type MockAccount = {
  id: string;
  email: string;
  f_name: string;
  l_name: string;
  avatar: string;
  role: MockAccountRole;
  mfa_enabled?: boolean;
};

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 'ec0a534a-693b-46c2-bde1-fd46c599f501',
    email: 'user@example.com',
    f_name: 'Demo',
    l_name: 'User',
    avatar: 'icon-2',
    role: 'user',
  },
  {
    id: 'a79d44a5-53f3-4734-8309-7a9c861adf9b',
    email: 'lawyer@example.com',
    f_name: 'Atty.',
    l_name: 'Reyes',
    avatar: 'icon-1',
    role: 'lawyer',
  },
  {
    id: 'b35c550f-0fb2-4f4c-85ea-2f24f37a4a5a',
    email: 'admin@example.com',
    f_name: 'Demo',
    l_name: 'Admin',
    avatar: 'icon-3',
    role: 'admin',
  },
];

export const DEFAULT_MOCK_ACCOUNT = MOCK_ACCOUNTS[1];

const mockMfaState = new Map<string, boolean>(
  MOCK_ACCOUNTS.map((account) => [account.id, Boolean(account.mfa_enabled)]),
);

export function findMockAccountByEmail(email?: string | null) {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return DEFAULT_MOCK_ACCOUNT;
  }

  return (
    MOCK_ACCOUNTS.find((account) => account.email === normalizedEmail) ??
    DEFAULT_MOCK_ACCOUNT
  );
}

export function findMockAccountById(accountId?: string | null) {
  if (!accountId) {
    return DEFAULT_MOCK_ACCOUNT;
  }

  return MOCK_ACCOUNTS.find((account) => account.id === accountId) ?? DEFAULT_MOCK_ACCOUNT;
}

export function createMockAccessToken(account: MockAccount) {
  return `mock-access-token:${account.id}:${Date.now()}`;
}

export function getMockAccountIdFromToken(token?: string | null) {
  if (!token?.startsWith('mock-access-token:')) {
    return null;
  }

  return token.split(':')[1] ?? null;
}

export function getMockMfaEnabled(accountId?: string | null) {
  const account = findMockAccountById(accountId);

  return mockMfaState.get(account.id) ?? false;
}

export function setMockMfaEnabled(accountId: string | null | undefined, enabled: boolean) {
  const account = findMockAccountById(accountId);

  mockMfaState.set(account.id, enabled);
}

export function createMockMfaToken(account: MockAccount) {
  return `mock-mfa-token:${account.id}:${Date.now()}`;
}

export function getMockAccountIdFromMfaToken(token?: string | null) {
  if (!token?.startsWith('mock-mfa-token:')) {
    return null;
  }

  return token.split(':')[1] ?? null;
}
