// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AccountPage from './profile-account-page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('AccountPage', () => {
  it('renders user-facing account information without implementation-facing contract text (#174)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      const decoded = decodeURIComponent(url);
      if (decoded.includes('/users/')) {
        return Promise.resolve(Response.json({
          f_name: 'Jane',
          l_name: 'Doe',
          email: 'jane@example.com',
          role: 'lawyer',
          avatar: 'Default',
        }));
      }
      if (decoded.includes('/google/connection')) {
        return Promise.resolve(Response.json({ connected: false, google_email: null }));
      }
      return Promise.reject(new Error(`Unexpected fetch ${url}`));
    }));

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <AccountPage />
      </QueryClientProvider>
    );

    expect(await screen.findByRole('heading', { level: 1, name: 'Account Details' })).toBeTruthy();
    expect(screen.getByText('Profile details are managed by your administrator and cannot be edited directly.')).toBeTruthy();
    expect(screen.queryByText(/backend contract/i)).toBeNull();

    expect(await screen.findByText('Jane')).toBeTruthy();
    expect(screen.getByText('Doe')).toBeTruthy();
    expect(screen.getByText('jane@example.com')).toBeTruthy();
  });
});
