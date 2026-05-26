import type {
  ListNotificationsParams,
  MarkAllReadResponse,
  NotificationListResponse,
  NotificationResponse,
  UnreadCountResponse,
} from '../notifications.api';

import { mockDelay } from './delay';

let mockNotifications: NotificationResponse[] = [
  {
    id: '8d248f93-1130-4ef0-91e7-eac6d20a6a1a',
    type: 'document_processed',
    title: 'Lease Agreement is ready',
    body: 'OCR, summary, and document indexing finished successfully.',
    is_read: false,
    event_metadata: { document_id: 'lease-agreement-demo' },
    created_at: '2026-05-20T08:30:00.000Z',
  },
  {
    id: 'f0c95d7d-f23b-4e7d-8f0a-3be4f85934dd',
    type: 'document_recorded',
    title: 'Deed of Sale was anchored',
    body: 'The document hash is now recorded on-chain and ready for verification.',
    is_read: false,
    event_metadata: { document_id: 'deed-of-sale-demo' },
    created_at: '2026-05-20T07:45:00.000Z',
  },
  {
    id: '1c84c601-a2c2-4062-8d1b-b23b1858d478',
    type: 'party_added',
    title: 'Juan Dela Cruz accepted invite',
    body: 'A shared document invitation was accepted by the participant.',
    is_read: true,
    event_metadata: { party_user_id: 'juan-demo' },
    created_at: '2026-05-19T16:10:00.000Z',
  },
];

export const mockNotificationsApi = {
  async list(params?: ListNotificationsParams): Promise<NotificationListResponse> {
    await mockDelay();

    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 20;
    const filteredNotifications = params?.unreadOnly
      ? mockNotifications.filter((notification) => !notification.is_read)
      : mockNotifications;
    const notifications = filteredNotifications.slice(offset, offset + limit);

    return {
      notifications,
      total: filteredNotifications.length,
    };
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    await mockDelay();

    return {
      unread: mockNotifications.filter((notification) => !notification.is_read).length,
    };
  },

  async markRead(notificationId: string): Promise<void> {
    await mockDelay();

    mockNotifications = mockNotifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, is_read: true }
        : notification,
    );
  },

  async markAllRead(): Promise<MarkAllReadResponse> {
    await mockDelay();

    const markedRead = mockNotifications.filter(
      (notification) => !notification.is_read,
    ).length;

    mockNotifications = mockNotifications.map((notification) => ({
      ...notification,
      is_read: true,
    }));

    return { marked_read: markedRead };
  },
};
