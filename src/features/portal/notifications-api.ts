import { portalRequest } from '@/shared/api/client';
import type { QueryClient } from '@tanstack/react-query';

export type PortalNotification = { id: string; title: string; body: string; is_read: boolean; created_at: string };
export type PortalNotificationList = { notifications: PortalNotification[]; total: number };

export const notificationQueryKeys = {
  inbox: ['portal-notifications'] as const,
  shell: ['portal-shell-notifications'] as const,
  unreadCount: ['portal-notif-count'] as const,
};

export async function fetchNotifications(): Promise<PortalNotificationList> {
  const response = await portalRequest('/api/portal/proxy?path=%2Fnotifications%2F', { credentials: 'same-origin' });
  return response.json();
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const response = await portalRequest('/api/portal/proxy?path=%2Fnotifications%2Funread-count', { credentials: 'same-origin' });
  const body: unknown = await response.json();
  if (typeof body !== 'object' || body === null || !('unread' in body) || typeof body.unread !== 'number') {
    throw new Error('The unread notification count was unavailable. Please try again.');
  }
  return body.unread;
}

export async function markAllNotificationsRead() {
  await portalRequest('/api/portal/proxy-post?path=%2Fnotifications%2Fread-all', {
    method: 'PATCH',
    credentials: 'same-origin',
  });
}

export async function markNotificationRead(id: string) {
  await portalRequest(`/api/portal/proxy-post?path=${encodeURIComponent(`/notifications/${id}/read`)}`, {
    method: 'PATCH',
    credentials: 'same-origin',
  });
}

export async function invalidateNotificationQueries(queryClient: QueryClient) {
  await Promise.all(Object.values(notificationQueryKeys).map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}
