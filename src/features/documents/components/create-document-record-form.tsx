'use client';

import { useState, type FormEvent } from 'react';
import { openDocumentRecord } from '@/features/documents/document-draft-api';

export function CreateDocumentRecordForm({ onCreated }: { onCreated: (documentId: string) => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const document = await openDocumentRecord(name);
      onCreated(document.document_id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to open this document record. Try again.');
    } finally {
      setPending(false);
    }
  }

  return <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-[#E4EEF9] bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-end">
    <label className="grid gap-1.5 text-sm font-bold text-[#0C2B49]">Document name
      <input required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 font-normal" />
    </label>
    <button type="submit" disabled={pending || !name.trim()} className="rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white disabled:opacity-60">{pending ? 'Opening record…' : 'Open document record'}</button>
    {error && <p role="alert" className="text-sm font-bold text-[#B42318] sm:col-span-2">{error}</p>}
    <p className="text-xs text-[#64748b] sm:col-span-2">This creates a PREPARING record. You can create a working draft from its Files tab.</p>
  </form>;
}
