'use client';

import { useState, type FormEvent } from 'react';
import { openDocumentRecord } from '@/features/documents/document-draft-api';
import type { ApiSchema } from '@/shared/types';

export function CreateDocumentRecordForm({ name, onNameChange, onCreated, onPendingChange }: { name: string; onNameChange: (name: string) => void; onCreated: (document: ApiSchema<'DocumentResponse'>) => void; onPendingChange?: (pending: boolean) => void }) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    onPendingChange?.(true);
    setError('');
    try {
      const document = await openDocumentRecord(name);
      onCreated(document);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to open this document record. Try again.');
    } finally {
      setPending(false);
      onPendingChange?.(false);
    }
  }

  return <form onSubmit={submit} className="mt-4 grid gap-3">
      <label htmlFor="new-document-name" className="grid gap-1.5 text-sm font-bold text-[#0C2B49]">Document name
        <input id="new-document-name" required maxLength={255} value={name} onChange={(event) => onNameChange(event.target.value)} className="w-full rounded-xl border border-[#D7E4F2] px-3 py-2.5 font-normal outline-none focus:border-[#0067B3]" />
      </label>
      {error && <p role="alert" className="text-sm font-bold text-[#B42318]">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button type="submit" disabled={pending || !name.trim()} className="min-h-11 rounded-full bg-[#0067B3] px-5 py-2.5 text-sm font-black text-white disabled:opacity-60">{pending ? 'Opening record…' : 'Continue to starting point'}</button>
      </div>
    </form>;
}
