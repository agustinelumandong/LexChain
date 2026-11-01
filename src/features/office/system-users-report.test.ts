import { afterEach, describe, expect, it, vi } from 'vitest';
import { portalRequest } from '@/shared/api/client';
import { toCsv } from '@/features/office/office-insight';
import { fetchSystemUsersReport } from '@/features/office/system-users-report';

vi.mock('@/shared/api/client', () => ({ portalRequest: vi.fn() }));

const users = [
  { id: 'before', email: 'before@example.com', f_name: 'Before', l_name: 'Range', role: 'user', is_active: true, created_at: '2026-04-30T23:59:59.999Z' },
  { id: 'from', email: 'from@example.com', f_name: 'From', l_name: 'Boundary', role: 'lawyer', is_active: true, created_at: '2026-05-01T00:00:00.000Z' },
  { id: 'to', email: 'to@example.com', f_name: 'To', l_name: 'Boundary', role: 'user', is_active: false, created_at: '2026-05-31T23:59:59.999Z' },
  { id: 'after', email: 'after@example.com', f_name: 'After', l_name: 'Range', role: 'user', is_active: true, created_at: '2026-06-01T00:00:00.000Z' },
  { id: 'offset', email: 'offset@example.com', f_name: 'Offset', l_name: 'After', role: 'user', is_active: true, created_at: '2026-05-31T23:30:00-02:00' },
];

function response(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

afterEach(() => vi.resetAllMocks());

describe('fetchSystemUsersReport', () => {
  it('loads and parses the same-origin admin user response', async () => {
    vi.mocked(portalRequest).mockResolvedValue(response({ users: [users[1]], total: 1 }));

    const report = await fetchSystemUsersReport('2026-05-01', '2026-05-31');

    expect(portalRequest).toHaveBeenCalledWith('/api/admin/users', { cache: 'no-store' });
    expect(report.rows).toEqual([{ Name: 'From Boundary', Email: 'from@example.com', Role: 'lawyer', Status: 'Active', Created: '2026-05-01' }]);
  });

  it('filters full UTC calendar days and excludes records at the next UTC midnight', async () => {
    vi.mocked(portalRequest).mockResolvedValue(response({ users, total: users.length }));

    const report = await fetchSystemUsersReport('2026-05-01', '2026-05-31');

    expect(report.rows.map((row) => row.Email)).toEqual(['from@example.com', 'to@example.com']);
  });

  it('keeps unrelated account identifiers out of the preview and CSV', async () => {
    vi.mocked(portalRequest).mockResolvedValue(response({ users: [users[1]], total: 1 }));
    const report = await fetchSystemUsersReport('2026-05-01', '2026-05-31');

    expect(report.columns).toEqual(['Name', 'Email', 'Role', 'Status', 'Created']);
    expect(report.rows[0]).not.toHaveProperty('id');
    expect(toCsv(report)).toBe('Name,Email,Role,Status,Created\r\nFrom Boundary,from@example.com,lawyer,Active,2026-05-01');
  });

  it('rejects an invalid backend response', async () => {
    vi.mocked(portalRequest).mockResolvedValue(response({ users: [{ id: 'bad' }], total: 1 }));

    await expect(fetchSystemUsersReport('2026-05-01', '2026-05-31')).rejects.toThrow('The API returned an invalid user list. Please try again.');
  });

  it('rejects invalid dates before making a request', async () => {
    await expect(fetchSystemUsersReport('2026-02-30', '2026-03-01')).rejects.toThrow('Select valid dates.');
    expect(portalRequest).not.toHaveBeenCalled();
  });
});
