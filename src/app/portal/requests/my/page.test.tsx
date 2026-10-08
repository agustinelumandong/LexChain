// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MyRequestsPage from '@/features/access/pages/requests-my-page';

const fetchMock = vi.fn();

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('MyRequestsPage', () => {
  it('shows request status as unavailable without calling the unsupported list endpoint', async () => {
    fetchMock.mockResolvedValue(Response.json({ role: 'document_participant' }));
    vi.stubGlobal('fetch', fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><MyRequestsPage /></QueryClientProvider>);

    expect(await screen.findByRole('heading', { name: 'My request status unavailable' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('not available in this portal yet');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(String(fetchMock.mock.calls[0][0])).toContain('%2Fusers%2F');
    expect(screen.queryByText('No e-copy requests yet')).toBeNull();
  });
});
