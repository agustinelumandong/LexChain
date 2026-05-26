import type { components } from '@lexchain/types/openapi';

import { env } from '@/shared/config';

import { apiClient } from './client';
import { mockNotificationsApi } from './mock';

type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

export type NotificationListResponse = ApiSchema<'NotificationListResponse'>;
export type NotificationResponse = ApiSchema<'NotificationResponse'>;
export type UnreadCountResponse = ApiSchema<'UnreadCountResponse'>;
export type MarkAllReadResponse = ApiSchema<'MarkAllReadResponse'>;

export type ListNotificationsParams = {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
};

const toQueryString = (params?: ListNotificationsParams) => {
  const searchParams = new URLSearchParams();

  if (params?.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }

  if (params?.offset !== undefined) {
    searchParams.set('offset', String(params.offset));
  }

  if (params?.unreadOnly !== undefined) {
    searchParams.set('unread_only', String(params.unreadOnly));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const encodeNotificationId = (notificationId: string) => {
  const trimmed = notificationId.trim();

  if (!trimmed) {
    throw new Error('notificationId is required');
  }

  return encodeURIComponent(trimmed);
};

export const notificationsApi = {
  list: (params?: ListNotificationsParams) => {
    if (env.useMockApi) {
      return mockNotificationsApi.list(params);
    }

    return apiClient.get<NotificationListResponse>(
      `/notifications/${toQueryString(params)}`,
    );
  },

  getUnreadCount: () => {
    if (env.useMockApi) {
      return mockNotificationsApi.getUnreadCount();
    }

    return apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  },

  markRead: (notificationId: string) => {
    const encodedNotificationId = encodeNotificationId(notificationId);

    if (env.useMockApi) {
      return mockNotificationsApi.markRead(notificationId);
    }

    return apiClient.patch<void>(
      `/notifications/${encodedNotificationId}/read`,
    );
  },

  markAllRead: () => {
    if (env.useMockApi) {
      return mockNotificationsApi.markAllRead();
    }

    return apiClient.patch<MarkAllReadResponse>('/notifications/read-all');
  },
};
