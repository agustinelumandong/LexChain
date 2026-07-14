import type { ApiSchema } from '@lexchain/types';

type UploadAccepted = ApiSchema<'DocumentUploadAcceptedResponse'>;

export async function uploadDocument({ file, title, bookId }: { file: File; title: string; bookId: string }): Promise<UploadAccepted> {
  const form = new FormData();
  form.append('file', file);
  const query = new URLSearchParams({ book_id: bookId, file_name: title });

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
