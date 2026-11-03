import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchIntegrityReport } from './integrity-report';
import { portalFetch } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({ portalFetch: vi.fn() }));

describe('integrity report', () => {
  beforeEach(() => vi.resetAllMocks());

  it('uses inclusive UTC dates and fetches all pages', async () => {
    const summary = { total: 101 };
    vi.mocked(portalFetch).mockResolvedValueOnce({ summary, results: Array.from({ length: 100 }, (_, id) => ({ id: String(id) })) }).mockResolvedValueOnce({ summary, results: [{ id: '100' }] });
    const report = await fetchIntegrityReport('2026-10-01', '2026-10-31');
    expect(report.rows).toHaveLength(101);
    expect(vi.mocked(portalFetch).mock.calls[0][0]).toContain('verified_to=2026-11-01T00%3A00%3A00.000Z');
    expect(vi.mocked(portalFetch).mock.calls[1][0]).toContain('offset=100');
  });

  it('rejects partial results and invalid date ranges', async () => {
    vi.mocked(portalFetch).mockResolvedValueOnce({ summary: { total: 2 }, results: [{ id: '1' }] });
    await expect(fetchIntegrityReport('2026-10-01', '2026-10-31')).rejects.toThrow();
    await expect(fetchIntegrityReport('2026-11-01', '2026-10-31')).rejects.toThrow();
  });

  it('rejects the report when a later page fails', async () => {
    vi.mocked(portalFetch).mockResolvedValueOnce({ summary: { total: 101 }, results: Array.from({ length: 100 }, (_, id) => ({ id: String(id) })) }).mockRejectedValueOnce(new Error('Network error'));
    await expect(fetchIntegrityReport('2026-10-01', '2026-10-31')).rejects.toThrow('Network error');
  });
});
