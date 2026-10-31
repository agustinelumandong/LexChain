// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MyRequestsPage from '@/features/access/pages/requests-my-page';

const fetchMock = vi.fn();

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('MyRequestsPage', () => {
  it('explains the unsupported direct route and links back to shared documents without calling a request endpoint', async () => {
    fetchMock.mockResolvedValue(Response.json({ role: 'document_participant' }));
    vi.stubGlobal('fetch', fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><MyRequestsPage /></QueryClientProvider>);

    expect(await screen.findByRole('heading', { name: 'Request tracking is not available yet' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('when e-copy requests are supported');
    expect(screen.getByRole('link', { name: 'Browse shared documents' }).getAttribute('href')).toBe('/portal/documents');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(String(fetchMock.mock.calls[0][0])).toContain('%2Fusers%2F');
    expect(screen.queryByText('No e-copy requests yet')).toBeNull();
  });

  it('shows a retryable profile error instead of a role message', async () => {
    fetchMock.mockResolvedValue(Response.json({ message: 'Profile service unavailable.' }, { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><MyRequestsPage /></QueryClientProvider>);

    expect(await screen.findByRole('heading', { name: 'Could not verify portal access' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to Documents' }).getAttribute('href')).toBe('/portal/documents');
    fireEvent.click(screen.getByRole('button', { name: 'Retry access check' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
