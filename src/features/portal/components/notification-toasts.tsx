'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getNotificationDestination } from '@/features/portal/notification-destination';
import type { PortalNotification } from '@/features/portal/notifications-api';

export function NotificationToasts({ notifications }: { notifications: PortalNotification[] | undefined }) {
  const seenIds = useRef<Set<string> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!notifications) return;
    if (!seenIds.current) {
      seenIds.current = new Set(notifications.map((notification) => notification.id));
      return;
    }

    for (const notification of notifications) {
      if (seenIds.current.has(notification.id)) continue;
      seenIds.current.add(notification.id);
      if (notification.is_read) continue;
      const destination = getNotificationDestination(notification);
      toast.info(notification.title, {
        description: notification.body,
        action: destination ? {
          label: 'View',
          onClick: () => {
            if (destination.external) window.open(destination.href, '_blank', 'noopener,noreferrer');
            else router.push(destination.href);
          },
        } : undefined,
      });
    }
  }, [notifications, router]);

  return null;
}
