import type { ApiSchema } from '@/shared/types/index';

type UploadAccepted = ApiSchema<'DocumentUploadAcceptedResponse'>;

export type UploadMetadata = {
  title: string;
  bookId: string;
  bookStatus?: 'OPEN' | 'CLOSED';
  docNo?: string;
  pageNo?: string;
};

export type UploadOutcome = {
  documentId: string;
  status: string;
  message: string;
};

export function getUploadFileError(file: File): string | null {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    ? null
    : 'Choose a PDF file.';
}

export function getRequiredUploadMetadataError({ title, bookId, bookStatus, docNo, pageNo }: UploadMetadata): string | null {
  if (!title.trim()) return 'Enter a document title.';
  if (!bookId) return 'Choose a book.';
  if (bookStatus === 'CLOSED') {
    const documentNumber = Number(docNo);
    const pageNumber = Number(pageNo);
    if (!docNo || !Number.isSafeInteger(documentNumber) || documentNumber < 1) return 'Enter the paper register document number.';
    if (!pageNo || !Number.isSafeInteger(pageNumber) || pageNumber < 1) return 'Enter the paper register page number.';
  }
  return null;
}

export function getUploadOutcome(response: UploadAccepted): UploadOutcome {
  return {
    documentId: response.document_id,
    status: response.status,
    message: response.message,
  };
}

export async function uploadDocument({ file, title, bookId, paperRegister }: {
  file: File;
  title: string;
  bookId: string;
  paperRegister?: { docNo: number; pageNo: number };
}): Promise<UploadAccepted> {
  const form = new FormData();
  form.append('file', file);
  const query = new URLSearchParams({ book_id: bookId, file_name: title });
  if (paperRegister) {
    query.set('doc_no', String(paperRegister.docNo));
    query.set('page_no', String(paperRegister.pageNo));
  }

  const res = await fetch(
    `/api/portal/proxy-post?path=${encodeURIComponent(`/documents/upload?${query.toString()}`)}`,
    { method: 'POST', body: form, credentials: 'same-origin' },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? err.message ?? 'Upload failed');
  }

  return res.json();
}
