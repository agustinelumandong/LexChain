'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ApiSchema } from '@/shared/types';
import { createGoogleDraft, getGoogleDraftUploadFileError, getGooglePickerToken, isGoogleDraftUrl } from '@/features/documents/document-draft-api';
import { clearGoogleDraftReturnContext, readGoogleDraftReturnContext, saveGoogleDraftReturnContext } from '@/shared/utils/google-draft-return-context';
import { Dropdown } from '@/shared/components/ui';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type Source = import('@/features/documents/document-draft-api').GoogleDraftSource;
type PickedFile = { id: string; name: string };

const PENDING_LABELS: Record<Source, string> = {
  blank: 'Creating draft…',
  template: 'Creating draft…',
  existing: 'Linking draft…',
  upload: 'Uploading document…',
};

const ACTION_LABELS: Record<Source, string> = {
  blank: 'Create blank Google draft',
  template: 'Copy selected template',
  existing: 'Use selected Google Doc',
  upload: 'Create draft from uploaded document',
};

function canCreateDraft(source: Source, picked: PickedFile | null, uploadFile: File | null, uploadError: string | null): boolean {
  if (source === 'blank') return true;
  if (source === 'upload') return Boolean(uploadFile) && !uploadError;
  return Boolean(picked);
}
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

function errorMessage(cause: unknown, source: Source): { message: string; needsGoogleConnection: boolean } {
  const failure = cause as Error & { code?: string; status?: number };
  if (failure.code === 'GOOGLE_NOT_CONNECTED' || failure.code === 'GOOGLE_RECONNECT_REQUIRED') {
    return {
      message: source === 'upload'
        ? 'Connect Google in account settings, then reselect your file after connecting Google. Uploaded files are not saved when you leave this page.'
        : 'Connect Google in account settings, then retry. Your draft choices are saved.',
      needsGoogleConnection: true,
    };
  }
  if (failure.status === 502) return {
    message: `Google Drive is unavailable. Try again in a moment. ${source === 'upload' ? 'Your selected file is still available.' : 'Your draft choices are saved.'}`,
    needsGoogleConnection: false,
  };
  return { message: failure.message || 'Unable to save the Google draft. Try again.', needsGoogleConnection: false };
}

function ExistingDraft({ document }: { document: ApiSchema<'DocumentResponse'> }) {
  const url = document.draft_url ?? '';
  const isDrafting = document.lifecycle === 'PREPARING' || document.lifecycle === 'READY_FOR_SIGNATURE';
  const description = document.lifecycle === 'PREPARING'
    ? 'Use this Google Doc to draft and share feedback. The signed PDF is added to this same record after external signing.'
    : document.lifecycle === 'READY_FOR_SIGNATURE'
      ? 'This is the agreed text for signing and notarization outside LexChain.'
      : 'This is the working draft for reference. The signed PDF is the filing and verification copy.';

  if (isDrafting) {
    return (
      <div className="mt-3 border-t border-[#E8F0F8] pt-3">
        <p className="sr-only">{description}</p>
        <p className="text-sm text-[#4B6382]">
          Document: <span className="font-semibold text-[#0C2B49]">{document.file_name || 'Working draft'}</span> · External drafting in Google Docs
        </p>
        {!isGoogleDraftUrl(url) && (
          <p role="alert" className="mt-2 text-sm font-bold leading-6 text-[#B42318]">The backend returned an invalid Google draft link. Contact your administrator.</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#D7E4F2] bg-white p-5 sm:p-6">
      <p className="text-lg font-bold leading-6 text-[#0C2B49]">
        {document.lifecycle === 'READY_FOR_SIGNATURE' ? 'Approved text in Google Docs' : 'Working draft in Google Docs'}
      </p>
      <p className="mt-2 max-w-3xl text-base leading-7 text-[#344054]">{description}</p>
      {isGoogleDraftUrl(url) ? (
        <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#006BB6] px-4 py-2 text-sm font-bold text-[#006BB6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
          <OpenInNewOutlinedIcon aria-hidden="true" sx={{ fontSize: 18 }} />
          {document.lifecycle === 'READY_FOR_SIGNATURE' ? 'Open approved Google Doc' : 'Open Google draft'}
        </a>
      ) : (
        <p role="alert" className="mt-4 text-base font-bold leading-7 text-[#B42318]">The backend returned an invalid Google draft link. Contact your administrator.</p>
      )}
    </div>
  );
}

function DraftUploadField({ uploadError, error, pending, onUploadFile }: {
  uploadError: string | null;
  error: string;
  pending: boolean;
  onUploadFile: (file: File | null) => void;
}) {
  const describedBy = ['google-draft-upload-help', uploadError ? 'google-draft-upload-error' : '', error ? 'google-draft-error' : ''].filter(Boolean).join(' ');

  return <div className="grid max-w-xl gap-2">
    <label htmlFor="google-draft-upload" className="text-base font-bold text-[#0C2B49]">Choose a document</label>
    <input id="google-draft-upload" type="file" accept=".docx,.doc,.odt,.rtf" disabled={pending} aria-invalid={Boolean(uploadError)} aria-describedby={describedBy} onChange={(event) => onUploadFile(event.currentTarget.files?.[0] ?? null)} className="min-h-11 w-full rounded-lg border border-[#D7E4F2] bg-white p-2 text-sm font-medium text-[#344054] file:mr-3 file:rounded-full file:border-0 file:bg-[#EAF4FF] file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-[#0067B3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-60" />
    <p id="google-draft-upload-help" className="text-sm leading-6 text-[#4B6382]">Supported formats: .docx, .doc, .odt, and .rtf. Maximum size: 10 MiB. Files are not saved when you leave to connect Google, so reselect the file when you return.</p>
    {uploadError && <p id="google-draft-upload-error" role="alert" className="text-sm font-bold leading-6 text-[#B42318]">{uploadError}</p>}
  </div>;
}

function DraftCreationForm({ source, picked, uploadFile, uploadError, error, needsGoogleConnection, pending, picking, onSourceChange, onPick, onUploadFile, onCreate, onConnectGoogle }: {
  source: Source;
  picked: PickedFile | null;
  uploadFile: File | null;
  uploadError: string | null;
  error: string;
  needsGoogleConnection: boolean;
  pending: boolean;
  picking: boolean;
  onSourceChange: (source: Source) => void;
  onPick: () => void;
  onUploadFile: (file: File | null) => void;
  onCreate: () => void;
  onConnectGoogle: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return <section aria-label="Draft starting point" className="space-y-4">
    <label className="grid max-w-sm gap-2 text-base font-bold text-[#0C2B49]">Choose a starting point
      <Dropdown ariaLabel="Choose a starting point" fullWidth value={source} onChange={(value) => onSourceChange(value as Source)} options={[{ label: 'Blank Google Doc', value: 'blank' }, { label: 'Copy a template', value: 'template' }, { label: 'Use an existing Google Doc', value: 'existing' }, { label: 'Upload a document', value: 'upload' }]} />
    </label>
    {(source === 'template' || source === 'existing') && <div className="space-y-2"><button type="button" disabled={picking} onClick={onPick} className="min-h-11 rounded-full border border-[#006BB6] px-4 py-2 text-base font-bold text-[#006BB6] disabled:opacity-60">{picking ? 'Opening Picker…' : source === 'template' ? 'Choose template' : 'Choose existing Google Doc'}</button>{picked && <p className="break-words text-base leading-7 text-[#0C2B49]">Selected: {picked.name}</p>}</div>}
    {source === 'upload' && <DraftUploadField uploadError={uploadError} error={error} pending={pending} onUploadFile={onUploadFile} />}
    {error && <div id="google-draft-error" role="alert" className="space-y-2 text-base font-bold leading-7 text-[#B42318]"><p>{error}</p>{needsGoogleConnection && <Link href="/portal/profile/account?google_draft_return=1" onClick={onConnectGoogle} className="inline-flex min-h-11 items-center rounded-full border border-[#006BB6] px-4 py-2 text-base text-[#006BB6]">Connect Google in account settings</Link>}</div>}
    <button type="button" disabled={pending || !canCreateDraft(source, picked, uploadFile, uploadError)} onClick={onCreate} className="min-h-12 rounded-full bg-[#0673C4] px-5 py-3 text-base font-bold text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-60">{pending ? PENDING_LABELS[source] : ACTION_LABELS[source]}</button>
    <div role="note" className="flex w-fit max-w-full items-start gap-2 rounded-lg border border-[#B8D7EE] bg-[#EEF6FF] px-3 py-2 text-sm leading-5 text-[#0C2B49]">
      <InfoOutlinedIcon aria-hidden="true" className="mt-0.5 shrink-0 text-[#0067B3]" fontSize="small" />
      <p>After signing outside LexChain, upload the signed PDF to this record.</p>
    </div>
  </section>;
}

export function GoogleDraftPanel({ document, onDocumentUpdated }: {
  document: ApiSchema<'DocumentResponse'>;
  onDocumentUpdated: (document: ApiSchema<'DocumentResponse'>) => void;
}) {
  const [source, setSource] = useState<Source>('blank');
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
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
      const failure = errorMessage(cause, source);
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
      const result = await createGoogleDraft(document.document_id, source, picked?.id, uploadFile ?? undefined);
      toast.success('Google draft is ready.');
      onDocumentUpdated(result);
    } catch (cause) {
      const failure = errorMessage(cause, source);
      setError(failure.message);
      setNeedsGoogleConnection(failure.needsGoogleConnection);
      const status = cause instanceof Error && 'status' in cause && typeof cause.status === 'number' ? cause.status : undefined;
      if (source !== 'blank' && source !== 'upload' && (status === 400 || status === 404)) setPicked(null);
    } finally {
      setPending(false);
    }
  }

  if (document.draft_url) return <ExistingDraft document={document} />;
  if (document.lifecycle !== 'PREPARING' || !document.permissions.can_create_draft) return null;

  function preserveChoices(event: React.MouseEvent<HTMLAnchorElement>) {
    try {
      saveGoogleDraftReturnContext({ documentId: document.document_id, source, picked: source === 'upload' ? null : picked });
    } catch (cause) {
      event.preventDefault();
      setError(cause instanceof Error ? cause.message : 'Your draft choices could not be saved. Try again.');
      setNeedsGoogleConnection(false);
    }
  }

  const uploadError = source === 'upload' && uploadFile ? getGoogleDraftUploadFileError(uploadFile) : null;

  return <DraftCreationForm source={source} picked={picked} uploadFile={uploadFile} uploadError={uploadError} error={error} needsGoogleConnection={needsGoogleConnection} pending={pending} picking={picking}
    onSourceChange={(value) => { setSource(value); setPicked(null); setUploadFile(null); setError(''); setNeedsGoogleConnection(false); }} onPick={() => void chooseFile()} onUploadFile={(file) => { setUploadFile(file); setError(''); setNeedsGoogleConnection(false); }} onCreate={() => void createDraft()} onConnectGoogle={preserveChoices} />;
}
