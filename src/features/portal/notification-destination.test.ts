import { describe, expect, it } from 'vitest';
import type { PortalNotification } from './notifications-api';
import { getNotificationDestination } from './notification-destination';

const documentTypes = ['party_added', 'party_removed', 'document_recorded', 'document_processed', 'document_failed'] as const;
const draftTypes = ['draft_comment', 'draft_reply', 'draft_resolved', 'draft_reopened'] as const;

function destinationInput(type: string, event_metadata?: Record<string, unknown>): Pick<PortalNotification, 'type' | 'event_metadata'> {
  return { type: type as PortalNotification['type'], event_metadata: event_metadata ?? {} };
}

describe('getNotificationDestination', () => {
  it.each(documentTypes)('resolves %s notifications through a validated document ID', (type) => {
    expect(getNotificationDestination(destinationInput(type, { document_id: 'doc_123-ABC' }))).toEqual({
      href: '/portal/documents/doc_123-ABC',
      external: false,
    });
  });

  it.each(draftTypes)('prefers a valid Google draft URL for %s notifications', (type) => {
    expect(getNotificationDestination(destinationInput(type, {
      draft_url: 'https://docs.google.com/document/d/draft-123',
      document_id: 'doc-123',
    }))).toEqual({ href: 'https://docs.google.com/document/d/draft-123', external: true });
  });

  it.each(draftTypes)('falls back to a validated document ID for %s notifications', (type) => {
    expect(getNotificationDestination(destinationInput(type, { document_id: 'doc-123', draft_url: 'https://evil.example/draft' }))).toEqual({
      href: '/portal/documents/doc-123',
      external: false,
    });
  });

  it.each([...documentTypes, ...draftTypes])('rejects malformed document IDs for %s notifications', (type) => {
    expect(getNotificationDestination(destinationInput(type, { document_id: '../admin' }))).toBeNull();
    expect(getNotificationDestination(destinationInput(type, { document_id: 'a'.repeat(129) }))).toBeNull();
  });

  it('rejects invalid draft URLs and falls back only to a valid document ID', () => {
    for (const draft_url of ['http://docs.google.com/document/d/draft', 'https://docs.google.com.evil.example/draft', 'not a URL']) {
      expect(getNotificationDestination(destinationInput('draft_comment', { draft_url }))).toBeNull();
      expect(getNotificationDestination(destinationInput('draft_comment', { draft_url, document_id: 'doc-123' }))).toEqual({
        href: '/portal/documents/doc-123',
        external: false,
      });
    }
  });

  it('returns null when metadata is absent or the runtime notification type is unknown', () => {
    expect(getNotificationDestination(destinationInput('document_failed'))).toBeNull();
    expect(getNotificationDestination(destinationInput('other_event', { document_id: 'doc-123' }))).toBeNull();
  });
});
