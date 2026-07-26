import { expect, it } from 'vitest';
import { canLoadDocumentActivity } from './document-activity-access';

it('waits for an issuer profile before loading document activity data', () => {
  expect(canLoadDocumentActivity(undefined)).toBe(false);
  expect(canLoadDocumentActivity('document_participant')).toBe(false);
  expect(canLoadDocumentActivity('document_issuer')).toBe(true);
});
