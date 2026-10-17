import { isGoogleDraftUrl } from '@/features/documents/document-draft-api';
import { googleDraftReturnPath } from '@/shared/utils/google-draft-return-context';
import type { PortalNotification } from './notifications-api';

const documentNotificationTypes = new Set([
  'party_added',
  'party_removed',
  'document_recorded',
  'document_processed',
  'document_failed',
]);
const draftNotificationTypes = new Set(['draft_comment', 'draft_reply', 'draft_resolved', 'draft_reopened']);

type NotificationDestination = { href: string; external: boolean };

function getDocumentDestination(documentId: unknown): NotificationDestination | null {
  if (typeof documentId !== 'string') return null;
  const href = googleDraftReturnPath(documentId);
  return href ? { href, external: false } : null;
}

export function getNotificationDestination(
  notification: Pick<PortalNotification, 'type' | 'event_metadata'>,
): NotificationDestination | null {
  const { type, event_metadata: metadata } = notification;
  if (typeof metadata !== 'object' || metadata === null) return null;

  if (documentNotificationTypes.has(type)) return getDocumentDestination(metadata.document_id);
  if (!draftNotificationTypes.has(type)) return null;

  const draftUrl = metadata.draft_url;
  if (typeof draftUrl === 'string' && isGoogleDraftUrl(draftUrl)) return { href: draftUrl, external: true };
  return getDocumentDestination(metadata.document_id);
}
