import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchDocumentActivityReport } from './document-activity-report';
import { portalFetch } from '@/shared/api/client';
import { toCsv } from './office-insight';

vi.mock('@/shared/api/client', () => ({ portalFetch: vi.fn() }));
const fetchPage = vi.mocked(portalFetch);
const doc = (id: string, overrides = {}) => ({ id, file_name: id, lifecycle: 'SIGNED', status: null, is_owner: true, created_at: '2026-07-01T00:00:00Z', ...overrides });

describe('document activity report', () => {
  beforeEach(() => fetchPage.mockReset());

  it('fetches every page and includes only owned records inside inclusive UTC dates', async () => {
    fetchPage.mockResolvedValueOnce(Array.from({ length: 50 }, (_, i) => doc(String(i), { is_owner: false })))
      .mockResolvedValueOnce([doc('first', { created_at: '2026-06-30T16:00:00-08:00' }), doc('last', { created_at: '2026-07-31T23:59:59Z', status: 'DONE' }), doc('outside', { created_at: '2026-08-01T00:00:00Z' })]);
    const report = await fetchDocumentActivityReport('2026-07-01', '2026-07-31');
    expect(fetchPage.mock.calls.map(([path]) => path)).toEqual(['/documents/?limit=50&offset=0', '/documents/?limit=50&offset=50']);
    expect(report.rows).toEqual([
      { Document: 'first', 'Created (UTC)': '2026-07-01', Lifecycle: 'SIGNED', 'Processing status': 'Unavailable' },
      { Document: 'last', 'Created (UTC)': '2026-07-31', Lifecycle: 'SIGNED', 'Processing status': 'DONE' },
    ]);
  });

  it('rejects a failed or malformed page instead of returning partial results', async () => {
    fetchPage.mockResolvedValueOnce(Array.from({ length: 50 }, (_, i) => doc(String(i)))).mockRejectedValueOnce(new Error('network'));
    await expect(fetchDocumentActivityReport('2026-07-01', '2026-07-31')).rejects.toThrow();
    fetchPage.mockResolvedValueOnce([doc('bad-date', { created_at: '2026-07-01T00:00:00' })]);
    await expect(fetchDocumentActivityReport('2026-07-01', '2026-07-31')).rejects.toThrow('incomplete');
    fetchPage.mockResolvedValueOnce([doc('bad', { is_owner: undefined })]);
    await expect(fetchDocumentActivityReport('2026-07-01', '2026-07-31')).rejects.toThrow();
  });

  it('rejects overlapping pages when the document list changes during loading', async () => {
    fetchPage.mockResolvedValueOnce(Array.from({ length: 50 }, (_, i) => doc(String(i))))
      .mockResolvedValueOnce([doc('49')]);
    await expect(fetchDocumentActivityReport('2026-07-01', '2026-07-31')).rejects.toThrow('changed');
  });

  it.each([['', '2026-07-01'], ['2026-08-01', '2026-07-01'], ['2026-02-30', '2026-03-01']])('rejects invalid dates', async (from, to) => {
    await expect(fetchDocumentActivityReport(from, to)).rejects.toThrow();
    expect(fetchPage).not.toHaveBeenCalled();
  });

  it('escapes CSV formulas and delimiters', () => {
    expect(toCsv({ reportType: 'office-document-activity', from: '', to: '', columns: ['Document'], rows: [{ Document: ' =SUM(1,2)' }, { Document: 'a"b\nc' }] })).toBe('Document\r\n"\' =SUM(1,2)"\r\n"a""b\nc"');
  });
});
