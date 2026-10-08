'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ApiSchema } from '@/shared/types';
import { createGoogleDraft, getGooglePickerToken, isGoogleDraftUrl } from '@/features/documents/document-draft-api';

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
  if (failure.code === 'GOOGLE_NOT_CONNECTED') return { message: 'Connect Google in account settings, then retry. Your draft choices are saved.', needsGoogleConnection: true };
  if (failure.status === 502) return { message: 'Google Drive is unavailable. Try again in a moment. Your draft choices are saved.', needsGoogleConnection: false };
  return { message: failure.message || 'Unable to create the Google draft. Try again.', needsGoogleConnection: false };
}

function ExistingDraft({ url }: { url: string }) {
  return <div className="rounded-xl border border-[#E8F0F8] p-4"><p className="font-bold text-[#0C2B49]">Working Google draft</p><p className="mt-1 text-sm text-[#64748b]">This editable draft is separate from the legal signed PDF.</p>{isGoogleDraftUrl(url) ? <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full border border-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-[#0985E7]">Open Google draft</a> : <p role="alert" className="mt-3 text-sm font-bold text-[#B42318]">The backend returned an invalid Google draft link. Contact your administrator.</p>}</div>;
}

function DraftCreationForm({ source, picked, error, needsGoogleConnection, pending, picking, onSourceChange, onPick, onCreate }: {
  source: Source;
  picked: PickedFile | null;
  error: string;
  needsGoogleConnection: boolean;
  pending: boolean;
  picking: boolean;
  onSourceChange: (source: Source) => void;
  onPick: () => void;
  onCreate: () => void;
}) {
  return <section aria-labelledby="google-draft-title" className="space-y-3 rounded-xl border border-[#CFE7FC] bg-[#F8FBFF] p-4">
    <div><h3 id="google-draft-title" className="font-bold text-[#0C2B49]">Working Google draft</h3><p className="mt-1 text-sm text-[#64748b]">This editable draft is separate from the legal signed PDF.</p></div>
    <label className="grid max-w-sm gap-1.5 text-sm font-bold text-[#0C2B49]">Draft source
      <select value={source} onChange={(event) => onSourceChange(event.target.value as Source)} className="rounded-xl border border-[#D7E4F2] bg-white px-3 py-2.5">
        <option value="blank">Blank Google Doc</option><option value="template">Copy a template</option><option value="existing">Use an existing Google Doc</option>
      </select>
    </label>
    {source !== 'blank' && <div className="space-y-2"><button type="button" disabled={picking} onClick={onPick} className="rounded-full border border-[#0985E7] px-4 py-2 text-sm font-bold text-[#0985E7] disabled:opacity-60">{picking ? 'Opening Picker…' : 'Choose Google Doc'}</button>{picked && <p className="text-sm text-[#0C2B49]">Selected: {picked.name}</p>}</div>}
    {error && <div role="alert" className="space-y-2 text-sm font-bold text-[#B42318]"><p>{error}</p>{needsGoogleConnection && <Link href="/portal/profile/account" className="inline-block rounded-full border border-[#0985E7] px-3 py-1.5 text-[#0985E7]">Connect Google in account settings</Link>}</div>}
    <button type="button" disabled={pending || (source !== 'blank' && !picked)} onClick={onCreate} className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-60">{pending ? 'Creating draft…' : source === 'blank' ? 'Create blank Google draft' : `Create draft from ${source}`}</button>
  </section>;
}

export function GoogleDraftPanel({ document }: { document: ApiSchema<'DocumentResponse'> }) {
  const [source, setSource] = useState<Source>('blank');
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [draftUrl, setDraftUrl] = useState<string | null>(document.draft_url ?? null);
  const [error, setError] = useState('');
  const [needsGoogleConnection, setNeedsGoogleConnection] = useState(false);
  const [pending, setPending] = useState(false);
  const [picking, setPicking] = useState(false);

  async function chooseFile() {
    setPicking(true);
    setError('');
    setNeedsGoogleConnection(false);
    try {
      await openGooglePicker(setPicked);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to open Google Picker. Try again.');
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
      setDraftUrl(result.draft_url ?? null);
    } catch (cause) {
      const failure = errorMessage(cause);
      setError(failure.message);
      setNeedsGoogleConnection(failure.needsGoogleConnection);
    } finally {
      setPending(false);
    }
  }

  if (draftUrl) return <ExistingDraft url={draftUrl} />;
  if (document.lifecycle !== 'PREPARING' || !document.permissions.can_create_draft) return null;

  return <DraftCreationForm source={source} picked={picked} error={error} needsGoogleConnection={needsGoogleConnection} pending={pending} picking={picking}
    onSourceChange={(value) => { setSource(value); setPicked(null); }} onPick={() => void chooseFile()} onCreate={() => void createDraft()} />;
}
