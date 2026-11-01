import { portalFetch } from '@/shared/api/client';
import type { ApiSchema } from '@/shared/types';

export async function fetchIntegrityReport(from: string, to: string) {
  if (!from || !to) throw new Error('Select both a start and end date.');
  if (from > to) throw new Error('Start date must be on or before end date.');
  const end = new Date(`${to}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  const params = new URLSearchParams({ verified_from: `${from}T00:00:00Z`, verified_to: end.toISOString(), limit: '100', offset: '0' });
  const rows: ApiSchema<'VerificationResultResponse'>[] = [];
  let summary: ApiSchema<'IntegrityReportSummary'> | undefined;
  for (;;) {
    params.set('offset', String(rows.length));
    const page = await portalFetch<ApiSchema<'IntegrityReportResponse'>>(`/documents/verifications?${params}`);
    if (!page.summary || !Array.isArray(page.results) || !Number.isInteger(page.summary.total)) throw new Error('Invalid integrity report response.');
    summary ??= page.summary;
    if (summary.total !== page.summary.total) throw new Error('Verification results changed while loading. Please try again.');
    const results = page.results;
    rows.push(...results);
    if (rows.length > summary.total) throw new Error('Verification results changed while loading. Please try again.');
    if (results.length < 100) break;
  }
  if (!summary || rows.length !== summary.total || new Set(rows.map((row) => row.id)).size !== rows.length) throw new Error('Verification results changed while loading. Please try again.');
  return { rows, summary };
}
