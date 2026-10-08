// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from '@/features/portal/pages/notifications-page';

const unreadNotification = { id: 'anchored', title: 'Document anchored', body: 'Your record is ready.', is_read: false, created_at: '2026-07-20T10:00:00Z' };
const readNotification = { ...unreadNotification, is_read: true };
const listResponse = (notification = unreadNotification) => Response.json({ notifications: [notification], total: 1 });
const fetchMock = vi.fn();

function renderNotifications() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const result = render(<QueryClientProvider client={queryClient}><NotificationsPage /></QueryClientProvider>);
  return { ...result, queryClient };
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('NotificationsPage', () => {
  it('distinguishes a successful empty inbox', async () => {
    fetchMock.mockResolvedValue(Response.json({ notifications: [], total: 0 }));
    renderNotifications();

    expect(await screen.findByText('No notifications yet')).toBeTruthy();
    expect(screen.getByText('0 unread')).toBeTruthy();
  });

  it('shows a failed inbox request and lets the user retry', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ message: 'Service unavailable' }, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ notifications: [], total: 0 }));
    renderNotifications();

    expect((await screen.findByRole('alert')).textContent).toContain('Unable to load notifications');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('No notifications yet')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('marks one notification read after a bodyless 204 and refreshes the inbox', async () => {
    let isRead = false;
    let finishRead: ((response: Response) => void) | undefined;
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input).includes(encodeURIComponent('/notifications/anchored/read'))) {
        return new Promise((resolve) => { finishRead = (response) => { isRead = true; resolve(response); }; });
      }
      return Promise.resolve(listResponse(isRead ? readNotification : unreadNotification));
    });
    renderNotifications();

    fireEvent.click(await screen.findByRole('button', { name: 'Mark Document anchored as read' }));
    expect(await screen.findByText('Marking notification as read…')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Mark Document anchored as read' }) as HTMLButtonElement).disabled).toBe(true);
    finishRead?.(new Response(null, { status: 204 }));

    expect(await screen.findByText('Marked as read')).toBeTruthy();
    expect(screen.getByText('0 unread')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent('/notifications/anchored/read')), expect.objectContaining({ method: 'PATCH' }));
  });

  it('shows mark-one and mark-all failures without changing the unread list', async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes(encodeURIComponent('/notifications/anchored/read'))) return Promise.resolve(Response.json({}, { status: 503 }));
      if (url.includes(encodeURIComponent('/notifications/read-all'))) return Promise.resolve(Response.json({}, { status: 503 }));
      return Promise.resolve(listResponse());
    });
    renderNotifications();

    fireEvent.click(await screen.findByRole('button', { name: 'Mark Document anchored as read' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Unable to mark this notification as read');
    expect(screen.getByRole('button', { name: 'Mark Document anchored as read' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));
    await waitFor(() => expect(screen.getAllByRole('alert').length).toBe(2));
    expect(screen.getByRole('button', { name: 'Mark Document anchored as read' })).toBeTruthy();
  });

  it('shows pending state while marking all notifications as read', async () => {
    let finishMutation: ((response: Response) => void) | undefined;
    let isRead = false;
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input).includes(encodeURIComponent('/notifications/read-all'))) {
        return new Promise((resolve) => { finishMutation = (response) => { isRead = true; resolve(response); }; });
      }
      return Promise.resolve(listResponse(isRead ? readNotification : unreadNotification));
    });
    renderNotifications();

    fireEvent.click(await screen.findByRole('button', { name: 'Mark all as read' }));
    expect(await screen.findByRole('button', { name: 'Marking as read…' })).toBeTruthy();
    finishMutation?.(Response.json({ message: 'All marked read' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Mark all as read' })).toBeNull());
  });
});
