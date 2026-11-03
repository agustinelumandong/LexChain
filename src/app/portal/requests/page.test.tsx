// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RequestsPage from '@/features/access/pages/requests-page';

const fetchMock = vi.fn();

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('RequestsPage', () => {
  it('loads the lawyer review queue', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ role: 'lawyer' })).mockResolvedValueOnce(Response.json({ requests: [], total: 0 }));
    vi.stubGlobal('fetch', fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><RequestsPage /></QueryClientProvider>);

    expect(await screen.findByText('No e-copy requests yet.')).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String(fetchMock.mock.calls[0][0])).toContain('%2Fusers%2F');
    expect(screen.queryByRole('button', { name: /Approve|Reject/ })).toBeNull();
    expect(String(fetchMock.mock.calls[1][0])).toContain('%2Fdocuments%2Fecopy-requests');
  });

  it('shows a retryable profile error instead of a permission message', async () => {
    fetchMock.mockResolvedValue(Response.json({ message: 'Profile service unavailable.' }, { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><RequestsPage /></QueryClientProvider>);

    expect(await screen.findByRole('heading', { name: 'Could not verify portal access' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to Documents' }).getAttribute('href')).toBe('/portal/documents');
    fireEvent.click(screen.getByRole('button', { name: 'Retry access check' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
