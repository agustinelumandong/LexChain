import type { ApiSchema } from '@/shared/types/index';

type UploadedDocument = ApiSchema<'DocumentResponse'>;

export type UploadMetadata = {
  title: string;
  bookId: string;
  bookStatus?: 'OPEN' | 'CLOSED';
  docNo?: string;
  pageNo?: string;
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

export async function uploadDocument({ file, title, bookId, paperRegister, confirmNewRecord = false }: {
  file: File;
  title: string;
  bookId: string;
  paperRegister?: { docNo: number; pageNo: number };
  confirmNewRecord?: boolean;
}): Promise<UploadedDocument> {
  const form = new FormData();
  form.append('file', file);
  const query = new URLSearchParams({ book_id: bookId, file_name: title });
  if (paperRegister) {
    query.set('doc_no', String(paperRegister.docNo));
    query.set('page_no', String(paperRegister.pageNo));
  }
  if (confirmNewRecord) query.set('confirm_new_record', 'true');

  const res = await fetch(
    `/api/portal/proxy-post?path=${encodeURIComponent(`/documents/upload?${query.toString()}`)}`,
    { method: 'POST', body: form, credentials: 'same-origin' },
  );

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const error = typeof body === 'object' && body !== null ? body : {};
    const detail = 'detail' in error && typeof error.detail === 'string' ? error.detail : undefined;
    const apiMessage = 'message' in error && typeof error.message === 'string' ? error.message : undefined;
    const errorCode = detail === 'READY_FOR_SIGNATURE_EXISTS'
      || ('code' in error && error.code === 'READY_FOR_SIGNATURE_EXISTS');
    const message = detail ?? apiMessage ?? 'Upload failed';
    throw Object.assign(new Error(message), {
      status: res.status,
      requiresConfirmation: res.status === 409 && errorCode,
    });
  }

  return res.json();
}
