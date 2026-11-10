// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ApiSchema } from '@/shared/types';
import { portalFetch } from '@/shared/api/client';
import { DocumentEcopyRequestHistory } from './document-ecopy-request-history';

vi.mock('@/shared/api/client', () => ({ portalFetch: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

function request(overrides: Partial<ApiSchema<'EcopyRequestResponse'>> = {}): ApiSchema<'EcopyRequestResponse'> {
  return {
    id: 'request-1',
    document_id: 'doc-101',
    file_name: 'service-agreement.pdf',
    client_id: 'client-1',
    client_name: 'Jordan Client',
    client_email: 'jordan@example.test',
    status: 'PENDING',
    requested_at: '2026-11-01T12:00:00Z',
    decided_at: null,
    decided_by: null,
    decline_reason: null,
    delivery_attempts: 0,
    delivered_at: null,
    can_download: false,
    can_retry_delivery: false,
    events: [{ action: 'requested', actor_id: null, detail: null, created_at: '2026-11-01T12:00:00Z' }],
    ...overrides,
  };
}

function renderHistory(showDeliveryError = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><DocumentEcopyRequestHistory documentId="doc-101" showDeliveryError={showDeliveryError} /></QueryClientProvider>);
}

describe('DocumentEcopyRequestHistory', () => {
  it('renders multiple owner-scoped requests with status, decision, decline and delivery history', async () => {
    vi.mocked(portalFetch).mockResolvedValue({
      requests: [
        request(),
        request({ id: 'request-2', client_name: 'Taylor Client', status: 'DECLINED', decided_at: '2026-11-01T13:00:00Z', decline_reason: 'Please correct the signed copy.', events: [
          { action: 'requested', actor_id: null, detail: null, created_at: '2026-11-01T12:00:00Z' },
          { action: 'declined', actor_id: 'lawyer-1', detail: 'Please correct the signed copy.', created_at: '2026-11-01T13:00:00Z' },
        ] }),
        request({ id: 'request-3', client_name: 'Morgan Client', status: 'APPROVED', delivery_status: 'FAILED', delivery_error: 'provider_error', delivery_attempts: 1, can_retry_delivery: true, events: [
          { action: 'requested', actor_id: null, detail: null, created_at: '2026-11-01T12:00:00Z' },
          { action: 'delivery_failed', actor_id: 'system', detail: 'provider_error', created_at: '2026-11-01T14:00:00Z' },
        ] }),
      ],
      total: 3,
    });

    renderHistory(true);

    const history = await screen.findByRole('region', { name: 'E-copy request history' });
    await within(history).findByText(/Taylor Client/);
    expect(within(history).getAllByRole('article')).toHaveLength(3);
    expect(within(history).getByText(/Jordan Client/)).toBeTruthy();
    expect(within(history).getByText(/Taylor Client/)).toBeTruthy();
    expect(within(history).getByText('Decline reason: Please correct the signed copy.')).toBeTruthy();
    expect(within(history).getByText('Declined')).toBeTruthy();
    expect(within(history).getByText('Email delivery: Failed')).toBeTruthy();
    expect(within(history).getByText('Delivery error: provider_error')).toBeTruthy();
    expect(within(history).getAllByText(/^Requested /)).toHaveLength(3);
    expect(portalFetch).toHaveBeenCalledWith('/documents/doc-101/ecopy-requests');
  });

  it('hides raw delivery errors unless they are requested', async () => {
    vi.mocked(portalFetch).mockResolvedValue({ requests: [request({ status: 'APPROVED', delivery_status: 'FAILED', delivery_error: 'provider_error' })], total: 1 });

    renderHistory();

    expect(await screen.findByText('Email delivery: Failed')).toBeTruthy();
    expect(screen.queryByText(/provider_error/)).toBeNull();
  });

  it('renders a party-scoped response as supplied by the backend', async () => {
    vi.mocked(portalFetch).mockResolvedValue({ requests: [request({ client_name: 'Own account' })], total: 1 });

    renderHistory();

    const history = await screen.findByRole('region', { name: 'E-copy request history' });
    await within(history).findByText(/Own account/);
    expect(within(history).getAllByRole('article')).toHaveLength(1);
    expect(within(history).getByText(/Own account/)).toBeTruthy();
  });

  it('announces loading while the scoped request is pending', async () => {
    let resolveRequest: ((value: ApiSchema<'EcopyRequestListResponse'>) => void) | undefined;
    vi.mocked(portalFetch).mockReturnValue(new Promise((resolve) => { resolveRequest = resolve; }) as never);

    renderHistory();

    expect(screen.getByRole('status').textContent).toContain('Loading e-copy request history');
    resolveRequest?.({ requests: [], total: 0 });
    expect(await screen.findByText('No e-copy requests for this document yet.')).toBeTruthy();
  });

  it('shows a distinct empty state', async () => {
    vi.mocked(portalFetch).mockResolvedValue({ requests: [], total: 0 });

    renderHistory();

    expect(await screen.findByText('No e-copy requests for this document yet.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a retryable error instead of an empty state', async () => {
    vi.mocked(portalFetch)
      .mockRejectedValueOnce(new Error('Request history unavailable.'))
      .mockResolvedValueOnce({ requests: [], total: 0 });

    renderHistory();

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByText('No e-copy requests for this document yet.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry request history' }));
    expect(await screen.findByText('No e-copy requests for this document yet.')).toBeTruthy();
  });

  it('treats a malformed response as an error instead of an empty history', async () => {
    vi.mocked(portalFetch).mockResolvedValue({ copies: [] } as never);

    renderHistory();

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByText('No e-copy requests for this document yet.')).toBeNull();
  });
});
