// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearGoogleDraftReturnContext,
  googleDraftReturnPath,
  readGoogleDraftReturnContext,
  saveGoogleDraftReturnContext,
} from '@/shared/utils/google-draft-return-context';

const context = {
  documentId: 'doc-101',
  source: 'template' as const,
  picked: { id: 'file-88', name: 'Client template' },
};

const uploadContext = {
  documentId: 'doc-101',
  source: 'upload' as const,
  picked: null,
};

beforeEach(() => sessionStorage.clear());

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe('Google draft return context', () => {
  it('round-trips only validated draft choices in the browser session', () => {
    saveGoogleDraftReturnContext(context);

    expect(readGoogleDraftReturnContext()).toEqual(context);
  });

  it('remembers the upload source without storing file data for the OAuth return', () => {
    saveGoogleDraftReturnContext(uploadContext);

    const stored = sessionStorage.getItem('lexchain:google-draft-return');
    expect(stored).toBe(JSON.stringify(uploadContext));
    expect(stored).not.toContain('private upload content');
    expect(readGoogleDraftReturnContext()).toEqual(uploadContext);
  });

  it('rejects malformed data, unknown sources, invalid IDs, and invalid file shapes', () => {
    saveGoogleDraftReturnContext(context);
    const key = sessionStorage.key(0)!;
    for (const value of [
      '{',
      JSON.stringify({ ...context, documentId: '../account' }),
      JSON.stringify({ ...context, source: 'other' }),
      JSON.stringify({ ...context, picked: { id: '', name: 'Client template' } }),
      JSON.stringify({ ...context, returnTo: 'https://attacker.test' }),
      JSON.stringify({ ...uploadContext, picked: { id: 'drive-file', name: 'not an upload' } }),
      JSON.stringify({ ...uploadContext, file: 'private upload content' }),
    ]) {
      sessionStorage.setItem(key, value);
      expect(readGoogleDraftReturnContext()).toBeNull();
    }
  });

  it('builds a same-origin document route only from a safe ID segment', () => {
    expect(googleDraftReturnPath('doc-101')).toBe('/portal/documents/doc-101');
    expect(googleDraftReturnPath('..')).toBeNull();
    expect(googleDraftReturnPath('https://attacker.test')).toBeNull();
    expect(googleDraftReturnPath('doc/101')).toBeNull();
  });

  it('clears the session context after it is consumed', () => {
    saveGoogleDraftReturnContext(context);
    clearGoogleDraftReturnContext();

    expect(readGoogleDraftReturnContext()).toBeNull();
  });

  it('reports when session storage cannot preserve the choices', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage disabled'); });

    expect(() => saveGoogleDraftReturnContext(context)).toThrow('storage disabled');
  });
});
