// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RequestsPage from '@/features/access/pages/requests-page';

const fetchMock = vi.fn();

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('RequestsPage', () => {
  it('shows request review as unavailable without calling unsupported request endpoints', async () => {
    fetchMock.mockResolvedValue(Response.json({ role: 'lawyer' }));
    vi.stubGlobal('fetch', fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><RequestsPage /></QueryClientProvider>);

    expect(await screen.findByRole('heading', { name: 'E-copy request review unavailable' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('not available in this portal yet');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(String(fetchMock.mock.calls[0][0])).toContain('%2Fusers%2F');
    expect(screen.queryByRole('button', { name: /Approve|Reject/ })).toBeNull();
    expect(screen.queryByText('No requests found')).toBeNull();
  });
});
