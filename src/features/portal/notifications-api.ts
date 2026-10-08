import type { QueryClient } from '@tanstack/react-query';

export type PortalNotification = { id: string; title: string; body: string; is_read: boolean; created_at: string };
export type PortalNotificationList = { notifications: PortalNotification[]; total: number };

export const notificationQueryKeys = {
  inbox: ['portal-notifications'] as const,
  shell: ['portal-shell-notifications'] as const,
  unreadCount: ['portal-notif-count'] as const,
};

export async function fetchNotifications(): Promise<PortalNotificationList> {
  const response = await fetch('/api/portal/proxy?path=%2Fnotifications%2F', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Unable to load notifications. Please try again.');
  return response.json();
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const response = await fetch('/api/portal/proxy?path=%2Fnotifications%2Funread-count', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Unable to load the unread notification count. Please try again.');
  const body: unknown = await response.json();
  if (typeof body !== 'object' || body === null || !('unread' in body) || typeof body.unread !== 'number') {
    throw new Error('The unread notification count was unavailable. Please try again.');
  }
  return body.unread;
}

export async function markAllNotificationsRead() {
  const response = await fetch('/api/portal/proxy-post?path=%2Fnotifications%2Fread-all', {
    method: 'PATCH',
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Unable to mark notifications as read. Please try again.');
}

export async function markNotificationRead(id: string) {
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent(`/notifications/${id}/read`)}`, {
    method: 'PATCH',
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Unable to mark this notification as read. Please try again.');
}

export async function invalidateNotificationQueries(queryClient: QueryClient) {
  await Promise.all(Object.values(notificationQueryKeys).map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}
