// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ApiSchema } from '@/shared/types';
import { GoogleDraftPanel } from './google-draft-panel';

const { createDraft, pickerToken } = vi.hoisted(() => ({ createDraft: vi.fn(), pickerToken: vi.fn() }));
vi.mock('@/features/documents/document-draft-api', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/features/documents/document-draft-api')>(),
  createGoogleDraft: createDraft,
  getGooglePickerToken: pickerToken,
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

const document = { document_id: 'doc-1', lifecycle: 'PREPARING', draft_url: null, permissions: { can_create_draft: true } } as ApiSchema<'DocumentResponse'>;

describe('GoogleDraftPanel busy state', () => {
  it('reports pending and completion when creating a draft fails', async () => {
    let rejectDraft!: (error: Error) => void;
    createDraft.mockReturnValue(new Promise((_, reject) => { rejectDraft = reject; }));
    const onBusyChange = vi.fn();
    render(<GoogleDraftPanel document={document} onDocumentUpdated={vi.fn()} onBusyChange={onBusyChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Create blank Google draft' }));
    expect(onBusyChange).toHaveBeenCalledWith(true);
    rejectDraft(new Error('Unable to create draft'));
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(false));
    expect(screen.getByRole('alert').textContent).toContain('Unable to create draft');
  });

  it('stays busy until the Google Picker is cancelled', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_PICKER_API_KEY', 'browser-key');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_PICKER_APP_ID', 'project-id');
    pickerToken.mockResolvedValue({ access_token: 'token' });
    let callback: (data: { action: string }) => void = () => undefined;
    const setVisible = vi.fn();
    class PickerBuilder {
      addView() { return this; }
      setOAuthToken() { return this; }
      setDeveloperKey() { return this; }
      setAppId() { return this; }
      setTitle() { return this; }
      setCallback(value: typeof callback) { callback = value; return this; }
      build() { return { setVisible }; }
    }
    class DocsView { setMimeTypes() { return this; } }
    vi.stubGlobal('gapi', { load: (_library: string, done: () => void) => done() });
    vi.stubGlobal('google', { picker: { Action: { PICKED: 'picked', CANCEL: 'cancel' }, ViewId: { DOCS: 'docs' }, DocsView, PickerBuilder } });
    const onBusyChange = vi.fn();
    render(<GoogleDraftPanel document={document} onDocumentUpdated={vi.fn()} onBusyChange={onBusyChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Choose a starting point' }));
    fireEvent.click(screen.getByRole('option', { name: 'Use an existing Google Doc' }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose existing Google Doc' }));
    await waitFor(() => expect(pickerToken).toHaveBeenCalled());
    expect(onBusyChange).toHaveBeenLastCalledWith(true);
    await waitFor(() => expect(setVisible).toHaveBeenCalledWith(true));
    callback({ action: 'cancel' });
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(false));
  });
});
