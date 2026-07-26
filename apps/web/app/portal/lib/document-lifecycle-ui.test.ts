import { describe, expect, it } from 'vitest';
import {
  canFinalizeDocument,
  canRestoreDocument,
  type DemoDocumentSnapshot,
} from './document-lifecycle-ui';

const snapshot: DemoDocumentSnapshot = {
  id: 'snapshot-1',
  document_id: 'document-1',
  text_hash: 'a'.repeat(64),
  created_at: '2026-07-26T00:00:00.000Z',
};

describe('document lifecycle UI', () => {
  it('allows an issuer to finalize a completed draft', () => {
    expect(canFinalizeDocument('issuer', 'COMPLETED', 'draft')).toBe(true);
    expect(canFinalizeDocument('participant', 'COMPLETED', 'draft')).toBe(false);
    expect(canFinalizeDocument('issuer', 'PROCESSING', 'draft')).toBe(false);
    expect(canFinalizeDocument('issuer', 'COMPLETED', 'finalized')).toBe(false);
  });

  it('allows an issuer to restore only a mismatched document with a snapshot', () => {
    expect(canRestoreDocument('issuer', 'mismatch', [snapshot])).toBe(true);
    expect(canRestoreDocument('participant', 'mismatch', [snapshot])).toBe(false);
    expect(canRestoreDocument('issuer', 'match', [snapshot])).toBe(false);
    expect(canRestoreDocument('issuer', 'mismatch', [])).toBe(false);
  });
});
