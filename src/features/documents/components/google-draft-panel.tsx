'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ApiSchema } from '@/shared/types';
import { createGoogleDraft, getGooglePickerToken, isGoogleDraftUrl } from '@/features/documents/document-draft-api';
import { clearGoogleDraftReturnContext, readGoogleDraftReturnContext, saveGoogleDraftReturnContext } from '@/shared/utils/google-draft-return-context';

type Source = ApiSchema<'CreateDraftRequest'>['source'];
type PickedFile = { id: string; name: string };
type PickerBuilder = {
  addView: (view: unknown) => PickerBuilder;
  setOAuthToken: (token: string) => PickerBuilder;
  setDeveloperKey: (key: string) => PickerBuilder;
  setAppId: (id: string) => PickerBuilder;
  setTitle: (title: string) => PickerBuilder;
  setCallback: (callback: (data: { action?: string; docs?: Array<{ id?: string; name?: string }> }) => void) => PickerBuilder;
  build: () => { setVisible: (visible: boolean) => void };
};
type PickerWindow = Window & {
  gapi?: { load: (name: string, callback: () => void) => void };
  google?: { picker: {
    Action: { PICKED: string };
    ViewId: { DOCS: string };
    DocsView: new (view: string) => { setMimeTypes: (types: string) => unknown };
    PickerBuilder: new () => PickerBuilder;
  } };
};

async function loadPicker(): Promise<void> {
  const browser = window as PickerWindow;
  if (!browser.gapi) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load Google Picker. Check your connection and try again.'));
      document.head.append(script);
    });
  }
  if (!browser.gapi) throw new Error('Google Picker did not load. Try again.');
  await new Promise<void>((resolve) => browser.gapi!.load('picker', resolve));
}

async function openGooglePicker(onPicked: (file: PickedFile) => void): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;
  const appId = process.env.NEXT_PUBLIC_GOOGLE_PICKER_APP_ID;
  if (!apiKey || !appId) throw new Error('Google Picker is not configured. Ask your administrator to set NEXT_PUBLIC_GOOGLE_PICKER_API_KEY and NEXT_PUBLIC_GOOGLE_PICKER_APP_ID.');
  const token = await getGooglePickerToken();
  await loadPicker();
  const picker = (window as PickerWindow).google?.picker;
  if (!picker) throw new Error('Google Picker did not initialize. Try again.');
  const view = new picker.DocsView(picker.ViewId.DOCS);
  view.setMimeTypes('application/vnd.google-apps.document');
  new picker.PickerBuilder().addView(view).setOAuthToken(token.access_token).setDeveloperKey(apiKey).setAppId(appId).setTitle('Choose a Google Doc').setCallback((data) => {
    if (data.action === picker.Action.PICKED && data.docs?.[0]?.id) onPicked({ id: data.docs[0].id, name: data.docs[0].name ?? 'Google Doc' });
  }).build().setVisible(true);
}

function errorMessage(cause: unknown): { message: string; needsGoogleConnection: boolean } {
  const failure = cause as Error & { code?: string; status?: number };
  if (failure.code === 'GOOGLE_NOT_CONNECTED' || failure.code === 'GOOGLE_RECONNECT_REQUIRED') return { message: 'Connect Google in account settings, then retry. Your draft choices are saved.', needsGoogleConnection: true };
  if (failure.status === 502) return { message: 'Google Drive is unavailable. Try again in a moment. Your draft choices are saved.', needsGoogleConnection: false };
  return { message: failure.message || 'Unable to save the Google draft. Try again.', needsGoogleConnection: false };
}

function ExistingDraft({ document }: { document: ApiSchema<'DocumentResponse'> }) {
  const url = document.draft_url ?? '';
  const description = document.lifecycle === 'PREPARING'
    ? 'Use this Google Doc to draft and share feedback. The signed PDF is added to this same record after external signing.'
    : document.lifecycle === 'READY_FOR_SIGNATURE'
      ? 'This is the agreed text. Print it, complete signatures and any required notarization outside LexChain, then attach the signed PDF to this same record.'
      : 'This is the working draft for reference. The signed PDF is the filing and verification copy.';

  return <div className="rounded-xl border border-[#D7E4F2] bg-white p-5 sm:p-6"><p className="text-lg font-bold leading-6 text-[#0C2B49]">{document.lifecycle === 'READY_FOR_SIGNATURE' ? 'Approved text in Google Docs' : 'Working draft in Google Docs'}</p><p className="mt-2 max-w-3xl text-base leading-7 text-[#344054]">{description}</p>{isGoogleDraftUrl(url) ? <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-12 items-center rounded-full border border-[#006BB6] px-5 py-3 text-base font-bold text-[#006BB6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">{document.lifecycle === 'READY_FOR_SIGNATURE' ? 'Open approved Google Doc' : 'Open Google draft'}</a> : <p role="alert" className="mt-4 text-base font-bold leading-7 text-[#B42318]">The backend returned an invalid Google draft link. Contact your administrator.</p>}</div>;
}

function DraftCreationForm({ source, picked, error, needsGoogleConnection, pending, picking, onSourceChange, onPick, onCreate, onConnectGoogle }: {
  source: Source;
  picked: PickedFile | null;
  error: string;
  needsGoogleConnection: boolean;
  pending: boolean;
  picking: boolean;
  onSourceChange: (source: Source) => void;
  onPick: () => void;
  onCreate: () => void;
  onConnectGoogle: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const pendingLabel = source === 'existing' ? 'Linking draft…' : 'Creating draft…';
  const actionLabel = source === 'blank' ? 'Create blank Google draft' : source === 'template' ? 'Copy selected template' : 'Use selected Google Doc';

  return <section aria-labelledby="google-draft-title" className="space-y-4 rounded-xl border border-[#D7E4F2] bg-white p-5 sm:p-6">
    <div><h3 id="google-draft-title" className="text-lg font-bold leading-6 text-[#0C2B49]">Start a working draft in Google Docs</h3><p className="mt-2 max-w-3xl text-base leading-7 text-[#344054]">Use a blank Doc, copy a template, or select a Google Doc you already started. After signing outside LexChain, upload the signed PDF to this same record.</p></div>
    <label className="grid max-w-sm gap-2 text-base font-bold text-[#0C2B49]">Choose a starting point
      <select value={source} onChange={(event) => onSourceChange(event.target.value as Source)} className="rounded-xl border border-[#B8C9D9] bg-white px-3 py-3 text-base font-medium">
        <option value="blank">Blank Google Doc</option><option value="template">Copy a template</option><option value="existing">Use an existing Google Doc</option>
      </select>
    </label>
    {source !== 'blank' && <div className="space-y-2"><button type="button" disabled={picking} onClick={onPick} className="min-h-11 rounded-full border border-[#006BB6] px-4 py-2 text-base font-bold text-[#006BB6] disabled:opacity-60">{picking ? 'Opening Picker…' : source === 'template' ? 'Choose template' : 'Choose existing Google Doc'}</button>{picked && <p className="break-words text-base leading-7 text-[#0C2B49]">Selected: {picked.name}</p>}</div>}
    {error && <div role="alert" className="space-y-2 text-base font-bold leading-7 text-[#B42318]"><p>{error}</p>{needsGoogleConnection && <Link href="/portal/profile/account?google_draft_return=1" onClick={onConnectGoogle} className="inline-flex min-h-11 items-center rounded-full border border-[#006BB6] px-4 py-2 text-base text-[#006BB6]">Connect Google in account settings</Link>}</div>}
    <button type="button" disabled={pending || (source !== 'blank' && !picked)} onClick={onCreate} className="min-h-12 rounded-full bg-[#0673C4] px-5 py-3 text-base font-bold text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7] disabled:opacity-60">{pending ? pendingLabel : actionLabel}</button>
  </section>;
}

export function GoogleDraftPanel({ document, onDocumentUpdated }: {
  document: ApiSchema<'DocumentResponse'>;
  onDocumentUpdated: (document: ApiSchema<'DocumentResponse'>) => void;
}) {
  const [source, setSource] = useState<Source>('blank');
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [error, setError] = useState('');
  const [needsGoogleConnection, setNeedsGoogleConnection] = useState(false);
  const [pending, setPending] = useState(false);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    const context = readGoogleDraftReturnContext();
    if (!context) return;
    if (context.documentId === document.document_id) {
      // Restore browser storage after the OAuth navigation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSource(context.source);
      setPicked(context.picked);
    }
    clearGoogleDraftReturnContext();
  }, [document.document_id]);

  async function chooseFile() {
    setPicking(true);
    setError('');
    setNeedsGoogleConnection(false);
    try {
      await openGooglePicker(setPicked);
    } catch (cause) {
      const failure = errorMessage(cause);
      setError(failure.message);
      setNeedsGoogleConnection(failure.needsGoogleConnection);
    } finally {
      setPicking(false);
    }
  }

  async function createDraft() {
    setPending(true);
    setError('');
    setNeedsGoogleConnection(false);
    try {
      const result = await createGoogleDraft(document.document_id, source, picked?.id);
      toast.success('Google draft is ready.');
      onDocumentUpdated(result);
    } catch (cause) {
      const failure = errorMessage(cause);
      setError(failure.message);
      setNeedsGoogleConnection(failure.needsGoogleConnection);
      const status = cause instanceof Error && 'status' in cause && typeof cause.status === 'number' ? cause.status : undefined;
      if (source !== 'blank' && (status === 400 || status === 404)) setPicked(null);
    } finally {
      setPending(false);
    }
  }

  if (document.draft_url) return <ExistingDraft document={document} />;
  if (document.lifecycle !== 'PREPARING' || !document.permissions.can_create_draft) return null;

  function preserveChoices(event: React.MouseEvent<HTMLAnchorElement>) {
    try {
      saveGoogleDraftReturnContext({ documentId: document.document_id, source, picked });
    } catch (cause) {
      event.preventDefault();
      setError(cause instanceof Error ? cause.message : 'Your draft choices could not be saved. Try again.');
      setNeedsGoogleConnection(false);
    }
  }

  return <DraftCreationForm source={source} picked={picked} error={error} needsGoogleConnection={needsGoogleConnection} pending={pending} picking={picking}
    onSourceChange={(value) => { setSource(value); setPicked(null); setError(''); setNeedsGoogleConnection(false); }} onPick={() => void chooseFile()} onCreate={() => void createDraft()} onConnectGoogle={preserveChoices} />;
}
