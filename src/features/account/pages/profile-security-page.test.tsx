// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import SecurityPage from './profile-security-page';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('offers password recovery from security settings', () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ mfa_enabled: false })));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><SecurityPage /></QueryClientProvider>);
  expect(screen.getByRole('link', { name: 'Reset password' }).getAttribute('href')).toBe('/forgot-password');
  expect(screen.getByText('Request a password reset link by email.')).toBeTruthy();
});
