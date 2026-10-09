'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dynamic from 'next/dynamic';
import type { ApiSchema } from '@/shared/types/index';

const PdfDocumentViewer = dynamic(() => import('@/features/documents/components/pdf-document-viewer'), {
  ssr: false,
  loading: () => <p className="text-sm font-medium text-[#64748b]">Loading PDF viewer…</p>,
});

type DocumentResponse = ApiSchema<'DocumentResponse'>;

async function fetchDocument(documentId: string): Promise<DocumentResponse> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent(`/documents/${documentId}`)}`, {
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Unable to load document');
  return response.json();
}

export default function PdfViewerPage() {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(true);
  const documentQuery = useQuery({
    queryKey: ['portal-doc', id],
    queryFn: () => fetchDocument(id),
    enabled: Boolean(id),
    retry: false,
  });
  const document = documentQuery.data;
  const pdfUrl = document?.signed_copy?.storage_url;

  return (
    <div className="space-y-5">
      <Link href={`/portal/documents/${id}`} className="flex items-center gap-2 text-sm font-bold text-[var(--portal-primary)]">
        <ArrowBackIcon fontSize="small" /> Back to Document
      </Link>

      <h1 className="text-lg font-extrabold text-[var(--portal-navy)]">Document preview</h1>

      {documentQuery.isPending ? (
        <p role="status" className="rounded-[18px] border border-[var(--portal-border-soft)] bg-white p-6 text-sm font-medium text-[var(--portal-text-muted)]">Loading document…</p>
      ) : documentQuery.isError ? (
        <section role="alert" className="rounded-[18px] border border-[var(--portal-border-soft)] bg-white p-6">
          <h2 className="font-extrabold text-[var(--portal-navy)]">Unable to load document preview</h2>
          <p className="mt-2 text-sm text-[var(--portal-text-muted)]">The document details could not be loaded.</p>
          <button type="button" onClick={() => void documentQuery.refetch()} className="mt-4 rounded-full border border-[var(--portal-border-soft)] px-4 py-2 text-sm font-bold text-[var(--portal-primary)]">Try again</button>
        </section>
      ) : !pdfUrl ? (
        <section aria-labelledby="preview-unavailable-heading" className="rounded-[18px] border border-[var(--portal-border-soft)] bg-white p-6">
          <h2 id="preview-unavailable-heading" className="font-extrabold text-[var(--portal-navy)]">Preview unavailable</h2>
          <p className="mt-2 text-sm text-[var(--portal-text-muted)]">No signed PDF is attached to this document.</p>
        </section>
      ) : (
        <section aria-labelledby="document-preview-heading" className="flex min-h-[400px] min-w-0 flex-col rounded-[18px] border border-[var(--portal-border-soft)] bg-white p-4 shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--portal-border-soft)] pb-4">
            <div className="min-w-0">
              <h2 id="document-preview-heading" className="break-words font-extrabold text-[var(--portal-navy)]">{document.signed_copy?.original_filename ?? document.file_name}</h2>
              <p className="mt-1 text-sm text-[var(--portal-text-muted)]">Current signed PDF</p>
            </div>
            <a href={pdfUrl} download className="rounded-xl bg-[var(--portal-primary)] px-4 py-2.5 text-sm font-semibold text-white">Download signed PDF</a>
          </div>
          <div className="relative flex min-h-[320px] min-w-0 flex-1 flex-col">
            <PdfDocumentViewer
              sourceUrl={pdfUrl}
              currentPage={currentPage}
              blocks={[]}
              selectedBlockIndex={null}
              hoveredBlockIndex={null}
              onPageChange={setCurrentPage}
              onSelectBlock={() => undefined}
              onHoverBlockChange={() => undefined}
              onLoadChange={setPdfLoading}
            />
            {pdfLoading && (
              <div role="status" aria-label="Loading document PDF" className="absolute inset-0 flex items-center justify-center bg-white/90">
                <span className="text-sm font-semibold text-[var(--portal-text-muted)]">Loading document PDF…</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
