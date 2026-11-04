'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import { Modal } from '@/features/admin/components/modal';
import { CreateDocumentRecordForm } from '@/features/documents/components/create-document-record-form';

export function NewDocumentAction() {
  const router = useRouter();
  const [showChoice, setShowChoice] = useState(false);
  const [showCreateRecord, setShowCreateRecord] = useState(false);

  return <>
    <button type="button" onClick={() => setShowChoice(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0067B3] px-5 py-2.5 text-sm font-black text-white hover:bg-[#005F9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"><AddIcon aria-hidden="true" sx={{ fontSize: 18 }} />New Document</button>
    <Modal open={showChoice} onClose={() => setShowChoice(false)} title="New Document">
      <p className="text-sm leading-6 text-[#4B6382]">Choose how you want to start. Both options lead to a document workspace.</p>
      <div className="mt-4 grid gap-3">
        <button type="button" onClick={() => { setShowChoice(false); setShowCreateRecord(true); }} className="min-h-11 rounded-xl border border-[#D7E4F2] p-4 text-left hover:bg-[#EEF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"><span className="block text-base font-bold text-[#0C2B49]">Prepare a document</span><span className="mt-1 block text-sm leading-6 text-[#4B6382]">Create or bring in a working draft, then attach the signed PDF later.</span></button>
        <Link href="/portal/upload" className="min-h-11 rounded-xl border border-[#D7E4F2] p-4 hover:bg-[#EEF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"><span className="block text-base font-bold text-[#0C2B49]">File a signed PDF</span><span className="mt-1 block text-sm leading-6 text-[#4B6382]">Add a document that has already been prepared and signed.</span></Link>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#4B6382]">Already prepared this document in LexChain? Open it from your documents to attach its signed PDF.</p>
    </Modal>
    {showCreateRecord && <CreateDocumentRecordForm onClose={() => setShowCreateRecord(false)} onCreated={(id) => router.push(`/portal/documents/${id}`)} />}
  </>;
}
