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
      const showToast = notification.type === 'document_failed' || notification.type === 'ecopy_delivery_failed'
        ? toast.error
        : toast.info;
      const hasLongDetails = notification.body.length > 180;
      showToast(notification.title, {
        description: hasLongDetails ? (
          <details>
            <summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">Show details</summary>
            <p className="mt-2 max-h-48 overflow-y-auto break-words">{notification.body}</p>
          </details>
        ) : notification.body,
        duration: hasLongDetails ? Infinity : undefined,
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
