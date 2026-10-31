import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchNotifications, fetchUnreadNotificationCount, markAllNotificationsRead, markNotificationRead } from './notifications-api';

afterEach(() => vi.unstubAllGlobals());

const requests = [fetchNotifications, fetchUnreadNotificationCount, markAllNotificationsRead, () => markNotificationRead('notice 1')] as const;

describe('notification requests', () => {
  it.each(requests)('preserves backend failures', async (request) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ message: 'Notification access denied', details: { reason: 'DENIED' } }, { status: 403 })));
    await expect(request()).rejects.toMatchObject({ name: 'PortalApiError', status: 403, message: 'Notification access denied', details: { reason: 'DENIED' } });
  });

  it('keeps JSON parsing, no-content mutations, encoded IDs and request methods', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ notifications: [], total: 0 }))
      .mockResolvedValueOnce(Response.json({ unread: 3 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchNotifications()).toEqual({ notifications: [], total: 0 });
    expect(await fetchUnreadNotificationCount()).toBe(3);
    await markAllNotificationsRead();
    await markNotificationRead('notice 1');
    expect(fetchMock.mock.calls).toEqual([
      ['/api/portal/proxy?path=%2Fnotifications%2F', { credentials: 'same-origin' }],
      ['/api/portal/proxy?path=%2Fnotifications%2Funread-count', { credentials: 'same-origin' }],
      ['/api/portal/proxy-post?path=%2Fnotifications%2Fread-all', { method: 'PATCH', credentials: 'same-origin' }],
      ['/api/portal/proxy-post?path=%2Fnotifications%2Fnotice%201%2Fread', { method: 'PATCH', credentials: 'same-origin' }],
    ]);
  });

  it('sends only one individual-read request for concurrent clicks on the same notification', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await Promise.all([markNotificationRead('notice-1'), markNotificationRead('notice-1')]);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/portal/proxy-post?path=%2Fnotifications%2Fnotice-1%2Fread', {
      method: 'PATCH',
      credentials: 'same-origin',
    });
  });

  it('rejects malformed unread counts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ unread: '3' })));
    await expect(fetchUnreadNotificationCount()).rejects.toThrow('The unread notification count was unavailable. Please try again.');
  });

  it('deduplicates session recovery across notification operations', async () => {
    vi.resetModules();
    const replace = vi.fn();
    vi.stubGlobal('window', { location: { replace } });
    const fetchMock = vi.fn().mockImplementation((url: string) => Promise.resolve(url === '/api/portal/logout' ? new Response(null, { status: 204 }) : Response.json({ message: 'Session rejected' }, { status: 401 })));
    vi.stubGlobal('fetch', fetchMock);
    const api = await import('./notifications-api');
    const outcomes = await Promise.allSettled([api.fetchNotifications(), api.markNotificationRead('notice-1')]);
    for (const outcome of outcomes) expect(outcome).toMatchObject({ status: 'rejected', reason: { status: 401, message: 'Session rejected' } });
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/portal/logout')).toHaveLength(1);
    expect(replace).toHaveBeenCalledExactlyOnceWith('/login');
  });
});
