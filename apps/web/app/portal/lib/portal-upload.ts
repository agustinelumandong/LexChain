import type { ApiSchema } from '@lexchain/types';

type UploadAccepted = ApiSchema<'DocumentUploadAcceptedResponse'>;

export async function uploadDocument({ file }: { file: File; title: string; bookId: string }): Promise<UploadAccepted> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(
    `/api/portal/proxy-post?path=${encodeURIComponent('/documents/upload')}`,
    { method: 'POST', body: form, credentials: 'same-origin' },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? err.message ?? 'Upload failed');
  }

  return res.json();
}
