import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { syncDraftComments } from '@/features/documents/document-lifecycle-api';
import type { ApiSchema } from '@/shared/types';

type DraftComments = ApiSchema<'DraftCommentListResponse'>;

// Each sync calls Google for every open viewer and the backend has no throttle.
const AUTO_SYNC_INTERVAL_MS = 30_000;
const MIN_AUTO_SYNC_GAP_MS = 5_000;

export function draftCommentsQueryKey(documentId: string) {
  return ['portal-document-comments', documentId];
}

/** Pulls draft comments from Google Docs, on a timer and on tab return when `autoSync` is on. Returns the manual trigger. */
export function useDraftCommentSync(documentId: string, autoSync: boolean): () => Promise<DraftComments> {
  const queryClient = useQueryClient();
  const inFlight = useRef<{ documentId: string; promise: Promise<DraftComments> } | null>(null);
  const lastStartedAt = useRef(0);

  const syncNow = useCallback(() => {
    if (inFlight.current?.documentId === documentId) return inFlight.current.promise;
    lastStartedAt.current = Date.now();
    const current = {
      documentId,
      promise: syncDraftComments(documentId)
        .then((comments) => {
          queryClient.setQueryData(draftCommentsQueryKey(documentId), comments);
          return comments;
        })
        .finally(() => {
          if (inFlight.current === current) inFlight.current = null;
        }),
    };
    inFlight.current = current;
    return current.promise;
  }, [documentId, queryClient]);

  useEffect(() => {
    if (!autoSync) return;
    const syncIfDue = () => {
      if (document.visibilityState !== 'visible' || Date.now() - lastStartedAt.current < MIN_AUTO_SYNC_GAP_MS) return;
      // Background failures stay silent: the next tick retries and "Last checked" keeps the real time.
      void syncNow().catch(() => undefined);
    };
    const interval = window.setInterval(syncIfDue, AUTO_SYNC_INTERVAL_MS);
    window.addEventListener('focus', syncIfDue);
    document.addEventListener('visibilitychange', syncIfDue);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', syncIfDue);
      document.removeEventListener('visibilitychange', syncIfDue);
    };
  }, [autoSync, syncNow]);

  return syncNow;
}
