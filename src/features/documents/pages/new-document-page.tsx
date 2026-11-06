'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQueryClient } from '@tanstack/react-query';
import { CreateDocumentRecordForm } from '@/features/documents/components/create-document-record-form';
import { DocumentPathSelector } from '@/features/documents/components/document-path-selector';
import { DocumentProgress } from '@/features/documents/components/document-progress';
import { DocumentProcessingStatus } from '@/features/documents/components/document-processing-status';
import DocumentDetailPage from '@/features/documents/pages/documents-id-page';
import UploadPage from '@/features/documents/pages/upload-page';
import type { ApiSchema } from '@/shared/types';

type Document = ApiSchema<'DocumentResponse'>;

export default function NewDocumentPage({ initialPath = 'google' }: { initialPath?: 'google' | 'pdf' }) {
  const queryClient = useQueryClient();
  const [path, setPath] = useState<'google' | 'pdf'>(initialPath);
  const [documentName, setDocumentName] = useState('');
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [workspaceParams, setWorkspaceParams] = useState<Promise<{ id: string }> | null>(null);
  const isPending = isCreatingRecord || isUploading;

  function rememberRecord(document: Document) {
    queryClient.setQueryData(['portal-doc', document.document_id], document);
    openWorkspace(document.document_id);
  }

  function openWorkspace(id: string) {
    window.history.replaceState(null, '', `/portal/documents/${encodeURIComponent(id)}`);
    setWorkspaceParams(Promise.resolve({ id }));
  }

  if (workspaceParams) return <DocumentDetailPage params={workspaceParams} />;

  return <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
    <header hidden={isPending}>
      <Link href="/portal/documents" className="mb-2 flex w-fit items-center gap-1.5 text-sm font-semibold text-[#0C2B49] hover:text-[#0067B3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
        <ArrowBackIcon aria-hidden="true" sx={{ fontSize: 16 }} /> Back to documents
      </Link>
      <h1 className="break-words text-xl font-black text-[#0C2B49]">{path === 'google' ? documentName.trim() || 'New document' : 'New document'}</h1><p className="mt-1 text-sm text-[#5B6382]">Choose how you want to start.</p>
    </header>
    {!isPending && <>
      <DocumentPathSelector path={path} onChange={setPath} disabled={isCreatingRecord} />
      <DocumentProgress path={path} currentStep={1} />
    </>}
    {isCreatingRecord && <div className="flex min-h-[calc(100dvh-8rem)] items-center">
      <DocumentProcessingStatus heading="Opening your document…" currentStatus="Opening record" description="Please keep this page open. Your document will open automatically when the request completes." />
    </div>}
    <div hidden={path !== 'google' || isCreatingRecord}>
      <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-[#0C2B49]">Set up your document</h2>
        <p className="mt-2 text-sm leading-6 text-[#4B6382]">Enter a name, then choose a blank Google Doc, existing document, template, or upload a working document.</p>
        <CreateDocumentRecordForm name={documentName} onNameChange={setDocumentName} onCreated={rememberRecord} onPendingChange={setIsCreatingRecord} />
      </section>
    </div>
    <div hidden={path !== 'pdf'}><UploadPage embedded onFiledDocument={openWorkspace} onPendingChange={setIsUploading} /></div>
  </main>;
}
