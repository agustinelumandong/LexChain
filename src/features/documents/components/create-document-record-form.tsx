'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/features/admin/components/modal';
import { openDocumentRecord } from '@/features/documents/document-draft-api';

export function CreateDocumentRecordForm({ onClose, onCreated }: { onClose: () => void; onCreated: (documentId: string) => void }) {
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

  function close() {
    if (!pending) onClose();
  }

  return <Modal open onClose={close} title="Create document draft">
    <p className="text-sm leading-6 text-[#4B6382]">This opens a PREPARING record. You can create a working draft from its Files tab.</p>
    <form onSubmit={submit} className="mt-4 grid gap-3">
      <label htmlFor="new-document-name" className="grid gap-1.5 text-sm font-bold text-[#0C2B49]">Document name
        <input id="new-document-name" required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-[#D7E4F2] px-3 py-2.5 font-normal outline-none focus:border-[#0985E7]" />
      </label>
      {error && <p role="alert" className="text-sm font-bold text-[#B42318]">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={close} disabled={pending} className="min-h-11 rounded-full border border-[#D7E4F2] px-5 py-2.5 text-sm font-bold text-[#0C2B49] disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={pending || !name.trim()} className="min-h-11 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white disabled:opacity-60">{pending ? 'Opening record…' : 'Open document record'}</button>
      </div>
    </form>
  </Modal>;
}
