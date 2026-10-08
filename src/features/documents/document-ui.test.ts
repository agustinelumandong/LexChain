import { describe, expect, it } from 'vitest';
import { getDocumentActions, getDocumentLifecycleLabel, getDocumentStatusLabel } from '@/features/documents/document-ui';
import type { ApiSchema } from '@/shared/types';

const document: ApiSchema<'DocumentResponse'> = {
  document_id: 'doc-1',
  file_name: 'document.pdf',
  lifecycle: 'SIGNED',
  status: null,
  on_chain: false,
  permissions: {
    can_view: true,
    can_rename: false,
    can_create_draft: false,
    can_mark_ready: false,
    can_reopen: false,
    can_attach_signed_copy: false,
    can_replace_signed_copy: false,
    can_correct_entry: false,
    can_cancel: false,
    can_finalize: false,
    can_share: false,
    can_revoke: false,
  },
  created_at: '2026-10-08T09:00:00Z',
};

describe('getDocumentStatusLabel', () => {
  it('names an OCR review-ready document instead of treating it as unknown', () => {
    expect(getDocumentStatusLabel('AWAITING_REVIEW')).toBe('Ready for review');
  });

  it('names post-approval enrichment as processing work', () => {
    expect(getDocumentStatusLabel('ENRICHING')).toBe('Preparing document');
  });

  it('keeps a null processing status distinct from document lifecycle', () => {
    expect(getDocumentStatusLabel(null)).toBe('No processing status yet');
    expect(getDocumentLifecycleLabel('READY_FOR_SIGNATURE')).toBe('Ready for signature');
  });

  it('uses backend permissions for visible detail actions', () => {
    const permitted = {
      ...document,
      on_chain: true,
      permissions: { ...document.permissions, can_rename: true, can_finalize: true },
    };

    expect(getDocumentActions('lawyer', permitted)).toEqual(['Rename document', 'Finalize', 'Verify integrity']);
    expect(getDocumentActions('lawyer', document)).toEqual([]);
    expect(getDocumentActions('user', permitted)).toEqual(['Verify integrity']);
  });
});
