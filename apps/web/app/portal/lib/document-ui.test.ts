import { describe, expect, it } from 'vitest';
import { getDocumentStatusLabel } from './document-ui';

describe('getDocumentStatusLabel', () => {
  it('names an OCR review-ready document instead of treating it as unknown', () => {
    expect(getDocumentStatusLabel('AWAITING_REVIEW')).toBe('Ready for review');
  });

  it('names post-approval enrichment as processing work', () => {
    expect(getDocumentStatusLabel('ENRICHING')).toBe('Preparing document');
  });
});
