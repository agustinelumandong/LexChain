import type { DemoReport } from './office-insight';
import { portalFetch } from '@/shared/api/client';
import { z } from 'zod';

const documentSchema = z.object({
  id: z.string().min(1),
  file_name: z.string(),
  lifecycle: z.string(),
  status: z.string().nullish(),
  is_owner: z.boolean(),
  created_at: z.string().refine((value) => /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && !Number.isNaN(Date.parse(value))),
});

export async function fetchDocumentActivityReport(from: string, to: string): Promise<DemoReport> {
  if (!from || !to) throw new Error('Select both a start and end date.');
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!validDate(from) || !validDate(to)) throw new Error('Select valid dates.');
  if (from > to) throw new Error('Start date must be on or before end date.');

  const rows: DemoReport['rows'] = [];
  const ids = new Set<string>();
  const limit = 50;
  let offset = 0;
  let page: z.infer<typeof documentSchema>[];
  do {
    const result: unknown = await portalFetch(`/documents/?limit=${limit}&offset=${offset}`);
    const parsed = z.array(documentSchema).max(limit).safeParse(result);
    if (!parsed.success) throw new Error('Document data was incomplete or invalid. Please try again.');
    page = parsed.data;
    for (const document of page) {
      if (ids.has(document.id)) throw new Error('Document list changed while loading. Please try again.');
      ids.add(document.id);
      const created = new Date(document.created_at).toISOString().slice(0, 10);
      if (document.is_owner && created >= from && created <= to) {
        rows.push({ Document: document.file_name, 'Created (UTC)': created, Lifecycle: document.lifecycle, 'Processing status': document.status ?? 'Unavailable' });
      }
    }
    offset += limit;
  } while (page.length === limit);

  return { reportType: 'office-document-activity', from, to, columns: ['Document', 'Created (UTC)', 'Lifecycle', 'Processing status'], rows };
}
