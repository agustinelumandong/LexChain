// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ApiSchema } from '@/shared/types';
import { DocumentEcopyRequestHistory } from './document-ecopy-request-history';
import { EcopyRequests } from './ecopy-requests';
import { portalFetch, portalRequest } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({ portalFetch: vi.fn(), portalRequest: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

function request(overrides: Partial<ApiSchema<'EcopyRequestResponse'>> = {}): ApiSchema<'EcopyRequestResponse'> {
  return {
    id: 'request-1', document_id: 'doc-101', file_name: 'service-agreement.pdf', client_id: 'client-1',
    client_name: 'Jordan Client', client_email: 'jordan@example.test', status: 'PENDING', requested_at: '2026-11-01T12:00:00Z',
    decided_at: null, decided_by: null, decline_reason: null, delivery_attempts: 0, delivered_at: null,
    can_download: false, can_retry_delivery: false, events: [], ...overrides,
  };
}

it('submits a decline with the optional reason', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [{ id: 'r1', document_id: 'd1', file_name: 'Document', client_name: 'Client', client_email: 'client@example.test', status: 'PENDING' }], total: 1 });
  vi.mocked(portalRequest).mockResolvedValue(new Response('{}'));
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EcopyRequests mode="review" /></QueryClientProvider>);
  fireEvent.change(await screen.findByLabelText('Decline reason (optional)'), { target: { value: 'Please update' } });
  fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
  await waitFor(() => expect(portalRequest).toHaveBeenCalledWith(expect.stringContaining('decline'), expect.objectContaining({ body: JSON.stringify({ reason: 'Please update' }) })));
});

it('asks before approving and sends nothing when cancelled', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [request()], total: 1 });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EcopyRequests mode="review" /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
  const dialog = screen.getByRole('dialog', { name: 'Approve e-copy?' });
  expect(within(dialog).getByText(/jordan@example\.test/)).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  expect(portalRequest).not.toHaveBeenCalled();
});

it('does not show clients raw delivery errors', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [request({ status: 'APPROVED', delivery_status: 'FAILED', delivery_error: 'smtp_timeout_42' })], total: 1 });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EcopyRequests mode="mine" /></QueryClientProvider>);
  expect(await screen.findByText(/Email delivery: Failed/)).toBeTruthy();
  expect(screen.queryByText(/smtp_timeout_42/)).toBeNull();
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
  expect(await screen.findByText(/Email delivery: Failed/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Retry email delivery' }));
  await waitFor(() => expect(portalRequest).toHaveBeenCalledWith(expect.stringContaining('retry-delivery'), expect.objectContaining({ method: 'POST' })));
});

it('does not offer a download when access is unavailable', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [{ id: 'r1', document_id: 'd1', file_name: 'Document', status: 'APPROVED', can_download: false }], total: 1 });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EcopyRequests mode="mine" /></QueryClientProvider>);
  await screen.findByText('Approved');
  expect(screen.queryByRole('link', { name: 'Download approved e-copy' })).toBeNull();
});

it('shows each personal request as a card with its document and status', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [{ id: 'r1', document_id: 'd1', file_name: 'Signed deed', status: 'PENDING', requested_at: '2026-10-31T12:00:00Z', can_download: false }], total: 1 });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EcopyRequests mode="mine" /></QueryClientProvider>);
  expect(await screen.findByRole('article')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Signed deed' }).getAttribute('href')).toBe('/portal/documents/d1');
  expect(screen.getByText('Pending')).toBeTruthy();
  expect(screen.getByText(/Requested/)).toBeTruthy();
});

it('shows an approval failure without claiming success', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ requests: [{ id: 'r1', document_id: 'd1', file_name: 'Document', client_name: 'Client', client_email: 'client@example.test', status: 'PENDING' }], total: 1 });
  vi.mocked(portalRequest).mockRejectedValue(new Error('Approval failed'));
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><EcopyRequests mode="review" /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
  fireEvent.click(screen.getByRole('button', { name: 'Approve and send' }));
  expect((await within(screen.getByRole('article')).findByRole('alert')).textContent).toContain('Approval failed');
  expect(screen.getByText('Pending')).toBeTruthy();
});

it.each([
  { action: 'approve', button: 'Approve', queueRequest: request(), updatedRequest: request({ status: 'APPROVED', delivery_status: 'SENT', delivered_at: '2026-11-01T14:00:00Z' }) },
  { action: 'decline', button: 'Decline', queueRequest: request(), updatedRequest: request({ status: 'DECLINED', decline_reason: 'Please correct the copy.' }) },
  { action: 'retry-delivery', button: 'Retry email delivery', queueRequest: request({ status: 'APPROVED', delivery_status: 'FAILED', can_retry_delivery: true }), updatedRequest: request({ status: 'APPROVED', delivery_status: 'SENT', delivered_at: '2026-11-01T14:00:00Z' }) },
])('refreshes the document-scoped history after $action', async ({ button, queueRequest, updatedRequest }) => {
  let historyCalls = 0;
  vi.mocked(portalFetch).mockImplementation(async (path: string) => {
    if (path === '/documents/doc-101/ecopy-requests') {
      historyCalls += 1;
      return { requests: [historyCalls === 1 ? request() : updatedRequest], total: 1 } as never;
    }
    if (path === '/documents/ecopy-requests') return { requests: [queueRequest], total: 1 } as never;
    throw new Error(`Unexpected request: ${path}`);
  });
  vi.mocked(portalRequest).mockResolvedValue(new Response('{}'));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

  render(<QueryClientProvider client={client}><DocumentEcopyRequestHistory documentId="doc-101" /><EcopyRequests mode="review" /></QueryClientProvider>);
  const history = await screen.findByRole('region', { name: 'E-copy request history' });
  await screen.findByRole('button', { name: button });
  fireEvent.click(screen.getByRole('button', { name: button }));
  if (button === 'Approve') fireEvent.click(screen.getByRole('button', { name: 'Approve and send' }));

  await waitFor(() => expect(historyCalls).toBe(2));
  if (updatedRequest.status === 'DECLINED') expect(within(history).getByText('Declined')).toBeTruthy();
  else expect(within(history).getByText(/Email delivery: Sent/)).toBeTruthy();
});
