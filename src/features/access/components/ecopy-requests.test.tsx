// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { EcopyRequests } from './ecopy-requests';
import { portalFetch, portalRequest } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({ portalFetch: vi.fn(), portalRequest: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('submits a decline with the optional reason', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [{ id: 'r1', document_id: 'd1', file_name: 'Document', client_name: 'Client', client_email: 'client@example.test', status: 'PENDING' }], total: 1 });
  vi.mocked(portalRequest).mockResolvedValue(new Response('{}'));
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EcopyRequests mode="review" /></QueryClientProvider>);
  fireEvent.change(await screen.findByLabelText('Decline reason (optional)'), { target: { value: 'Please update' } });
  fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
  await waitFor(() => expect(portalRequest).toHaveBeenCalledWith(expect.stringContaining('decline'), expect.objectContaining({ body: JSON.stringify({ reason: 'Please update' }) })));
});

it('offers an approved download only when the backend permits it', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [{ id: 'r1', document_id: 'd1', file_name: 'Document', status: 'APPROVED', can_download: true }], total: 1 });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EcopyRequests mode="mine" /></QueryClientProvider>);
  expect((await screen.findByRole('link', { name: 'Download approved e-copy' })).getAttribute('href')).toBe('/api/portal/documents/d1/file?download=1');
});

it('shows a failed email delivery and lets the lawyer retry it', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [{ id: 'r1', document_id: 'd1', file_name: 'Document', client_name: 'Client', client_email: 'client@example.test', status: 'APPROVED', delivery_status: 'FAILED', delivery_error: 'provider_error', can_retry_delivery: true }], total: 1 });
  vi.mocked(portalRequest).mockResolvedValue(new Response('{}'));
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EcopyRequests mode="review" /></QueryClientProvider>);
  expect(await screen.findByText(/Email delivery: FAILED/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Retry email delivery' }));
  await waitFor(() => expect(portalRequest).toHaveBeenCalledWith(expect.stringContaining('retry-delivery'), expect.objectContaining({ method: 'POST' })));
});

it('does not offer a download when access is unavailable', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [{ id: 'r1', document_id: 'd1', file_name: 'Document', status: 'APPROVED', can_download: false }], total: 1 });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EcopyRequests mode="mine" /></QueryClientProvider>);
  await screen.findByText('APPROVED');
  expect(screen.queryByRole('link', { name: 'Download approved e-copy' })).toBeNull();
});

it('shows each personal request as a card with its document and status', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [{ id: 'r1', document_id: 'd1', file_name: 'Signed deed', status: 'PENDING', requested_at: '2026-10-31T12:00:00Z', can_download: false }], total: 1 });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EcopyRequests mode="mine" /></QueryClientProvider>);
  expect(await screen.findByRole('article')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Signed deed' }).getAttribute('href')).toBe('/portal/documents/d1');
  expect(screen.getByText('PENDING')).toBeTruthy();
  expect(screen.getByText(/Requested/)).toBeTruthy();
});

it('shows an approval failure without claiming success', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [{ id: 'r1', document_id: 'd1', file_name: 'Document', client_name: 'Client', client_email: 'client@example.test', status: 'PENDING' }], total: 1 });
  vi.mocked(portalRequest).mockRejectedValue(new Error('Approval failed'));
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><EcopyRequests mode="review" /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
  expect((await screen.findByRole('alert')).textContent).toContain('Approval failed');
  expect(screen.getByText('Status: PENDING')).toBeTruthy();
});
