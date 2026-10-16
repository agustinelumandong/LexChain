import type { ApiSchema } from '@/shared/types/index';

type UploadedDocument = ApiSchema<'DocumentResponse'>;
export const MAX_SIGNED_PDF_BYTES = 60 * 1024 * 1024;

export type UploadValidationError = { field?: string; message: string };
export type RelatedWaitingDocument = {
  documentId: string;
  fileName: string;
  parties: Array<{ name: string; email?: string; role?: string }>;
};

export class UploadRequestError extends Error {
  readonly status: number;
  readonly reason?: string;
  readonly details?: Record<string, unknown>;
  readonly relatedDocuments: RelatedWaitingDocument[];
  readonly validationErrors: UploadValidationError[];
  readonly documentId?: string;
  readonly requiresConfirmation: boolean;

  constructor(body: unknown, status: number) {
    const envelope = isRecord(body) ? body : {};
    const details = isRecord(envelope.details) ? envelope.details : undefined;
    const legacyDetail = typeof envelope.detail === 'string' ? envelope.detail : undefined;
    const detailObject = isRecord(envelope.detail) ? envelope.detail : {};
    const reason = getString(details?.reason)
      ?? getString(detailObject.reason)
      ?? getString(envelope.code)
      ?? (legacyDetail === 'READY_FOR_SIGNATURE_EXISTS' ? legacyDetail : undefined);
    const message = getString(envelope.message)
      ?? getString(detailObject.message)
      ?? legacyDetail
      ?? 'Upload failed';

    super(message);
    this.name = 'UploadRequestError';
    this.status = status;
    this.reason = reason;
    this.details = details;
    this.relatedDocuments = getRelatedWaitingDocuments(details?.related_documents);
    this.validationErrors = getUploadValidationErrors(details?.errors ?? details?.validation_errors ?? envelope.detail);
    this.documentId = getString(details?.document_id);
    this.requiresConfirmation = status === 409 && reason === 'READY_FOR_SIGNATURE_EXISTS';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function getRelatedWaitingDocuments(value: unknown): RelatedWaitingDocument[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const documentId = getString(entry.document_id) ?? getString(entry.id);
    if (!documentId) return [];
    const partyEntries = Array.isArray(entry.parties) ? entry.parties : Array.isArray(entry.party_information) ? entry.party_information : [];
    const parties = partyEntries.flatMap((party) => {
      if (!isRecord(party)) return [];
      const firstName = getString(party.f_name) ?? getString(party.first_name);
      const lastName = getString(party.l_name) ?? getString(party.last_name);
      const name = getString(party.name) ?? ([firstName, lastName].filter(Boolean).join(' ') || getString(party.email));
      if (!name) return [];
      return [{ name, email: getString(party.email), role: getString(party.role) }];
    });
    return [{
      documentId,
      fileName: getString(entry.file_name) ?? getString(entry.title) ?? 'Waiting document',
      parties,
    }];
  });
}

function getUploadValidationErrors(value: unknown): UploadValidationError[] {
  const entries = Array.isArray(value)
    ? value
    : isRecord(value) ? Object.entries(value).flatMap(([field, messages]) => (Array.isArray(messages) ? messages : [messages]).map((message) => ({ field, message }))) : [];
  return entries.flatMap((entry) => {
    if (typeof entry === 'string') return [{ message: entry }];
    if (!isRecord(entry)) return [];
    const location = Array.isArray(entry.loc) ? entry.loc.filter((part) => typeof part === 'string').join('.') : undefined;
    const field = getString(entry.field) ?? getString(entry.path) ?? location;
    const message = getString(entry.message) ?? getString(entry.msg) ?? getString(entry.detail);
    return message ? [{ field, message }] : [];
  });
}

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
    throw new UploadRequestError(body, res.status);
  }

  return res.json();
}
