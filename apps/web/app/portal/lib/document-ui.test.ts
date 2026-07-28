import { describe, expect, it } from 'vitest';
import { getDocumentActions, getDocumentStatusLabel } from './document-ui';

describe('getDocumentStatusLabel', () => {
  it('names an OCR review-ready document instead of treating it as unknown', () => {
    expect(getDocumentStatusLabel('AWAITING_REVIEW')).toBe('Ready for review');
  });

  it('names post-approval enrichment as processing work', () => {
    expect(getDocumentStatusLabel('ENRICHING')).toBe('Preparing document');
  });

  it('offers review only to issuers when OCR has finished', () => {
    expect(getDocumentActions('issuer', { status: ' awaiting_review ' })).toContain('Review extracted text');
    expect(getDocumentActions('issuer', { status: 'ready_for_review' })).toContain('Review extracted text');
    expect(getDocumentActions('participant', { status: 'AWAITING_REVIEW' })).not.toContain('Review extracted text');
    expect(getDocumentActions('issuer', { status: 'COMPLETED' })).not.toContain('Review extracted text');
  });
});
