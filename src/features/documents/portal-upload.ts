import type { ApiSchema } from '@/shared/types/index';

type UploadedDocument = ApiSchema<'DocumentResponse'>;
export const MAX_SIGNED_PDF_BYTES = 60 * 1024 * 1024;

export type UploadMetadata = {
  title: string;
  bookId: string;
  bookStatus?: ApiSchema<'BookResponse'>['status'];
  manualNumbers?: boolean;
  docNo?: string;
  pageNo?: string;
};

export function getUploadFileError(file: File): string | null {
  if (file.size === 0) return 'Choose a non-empty PDF file.';
  if (file.size > MAX_SIGNED_PDF_BYTES) return 'PDF files must be 60 MiB or smaller.';
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') ? null : 'Choose a PDF file.';
}

export function getRegisterEntryError({ bookId, bookStatus, manualNumbers, docNo, pageNo }: {
  bookId: string;
  bookStatus?: ApiSchema<'BookResponse'>['status'];
  manualNumbers: boolean;
  docNo?: string;
  pageNo?: string;
}): string | null {
  if (!bookId) return 'Choose a book.';
  if (bookStatus !== 'CLOSED' && !manualNumbers) return null;

  const documentNumber = Number(docNo);
  const pageNumber = Number(pageNo);
  if (!docNo) return 'Enter the paper register document number.';
  if (!Number.isSafeInteger(documentNumber)) return 'Enter a whole paper register document number.';
  if (documentNumber < 1) return 'Enter a positive paper register document number.';
  if (!pageNo) return 'Enter the paper register page number.';
  if (!Number.isSafeInteger(pageNumber)) return 'Enter a whole paper register page number.';
  if (pageNumber < 1) return 'Enter a positive paper register page number.';
  return null;
}

export function getRequiredUploadMetadataError({ title, bookId, bookStatus, manualNumbers, docNo, pageNo }: UploadMetadata): string | null {
  if (!title.trim()) return 'Enter a document title.';
  return getRegisterEntryError({ bookId, bookStatus, manualNumbers: manualNumbers ?? Boolean(docNo || pageNo), docNo, pageNo });
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
