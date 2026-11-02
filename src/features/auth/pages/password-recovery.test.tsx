// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import ForgotPasswordPage from '@/features/auth/pages/forgot-password-page';
import ResetPasswordPage from '@/features/auth/pages/reset-password-page';
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(window.location.search) }));
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it('requests recovery and displays the generic confirmation', async () => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
  const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 })); vi.stubGlobal('fetch', fetchMock);
  render(<ForgotPasswordPage />); fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } }); fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
  expect(await screen.findByText('If an account exists for that email, a reset link has been sent.')).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledWith('/api/auth/password-recovery', expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'person@example.com' }) }));
});
it('submits the token hash and new password', async () => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false'); window.history.replaceState({}, '', '/reset-password?token_hash=abc&type=recovery');
  const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 })); vi.stubGlobal('fetch', fetchMock);
  render(<ResetPasswordPage />); fireEvent.change(await screen.findByLabelText('New password'), { target: { value: 'Password1' } }); fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'Password1' } }); fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
  expect(await screen.findByText('Your password has been updated. Please sign in.')).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledWith('/api/auth/password-reset', expect.objectContaining({ method: 'POST', body: JSON.stringify({ token_hash: 'abc', new_password: 'Password1' }) }));
});

it.each([400, 502])('requires a new link after reset returns %s', async (status) => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false'); window.history.replaceState({}, '', '/reset-password?token_hash=abc&type=recovery');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));
  render(<ResetPasswordPage />); fireEvent.change(await screen.findByLabelText('New password'), { target: { value: 'Password1' } }); fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'Password1' } }); fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
  expect(await screen.findByRole('link', { name: 'Request a new link' })).toBeTruthy();
});
it.each([422, 429])('allows retry after reset returns %s', async (status) => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false'); window.history.replaceState({}, '', '/reset-password?token_hash=abc&type=recovery');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));
  render(<ResetPasswordPage />); fireEvent.change(await screen.findByLabelText('New password'), { target: { value: 'Password1' } }); fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'Password1' } }); fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
  expect(await screen.findByRole('alert')).toBeTruthy(); expect(screen.getByRole('button', { name: 'Reset password' })).toBeTruthy();
});
it('rejects ambiguous reset links', async () => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false'); window.history.replaceState({}, '', '/reset-password?token_hash=abc&token_hash=def&type=recovery');
  render(<ResetPasswordPage />); expect(await screen.findByText('This password reset link is invalid or has expired.')).toBeTruthy();
});
