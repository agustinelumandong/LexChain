import { adminUserListResponseSchema } from '@/features/admin';
import { portalRequest } from '@/shared/api/client';
import { assertReportDateRange, type Report } from './office-insight';

const columns = ['Name', 'Email', 'Role', 'Status', 'Created'];
const dayMilliseconds = 24 * 60 * 60 * 1000;

function utcDayStart(value: string): number {
  return Date.parse(`${value}T00:00:00.000Z`);
}

export async function fetchSystemUsersReport(from: string, to: string): Promise<Report> {
  assertReportDateRange(from, to);
  const start = utcDayStart(from);
  const end = utcDayStart(to);

  const response = await portalRequest('/api/admin/users', { cache: 'no-store' });
  const payload: unknown = await response.json().catch(() => null);
  const parsed = adminUserListResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error('The API returned an invalid user list. Please try again.');

  const rows = parsed.data.users.flatMap((user) => {
    const createdAt = Date.parse(user.created_at);
    if (!Number.isFinite(createdAt) || createdAt < start || createdAt >= end + dayMilliseconds) return [];
    const name = `${user.f_name} ${user.l_name}`.trim();
    return [{
      Name: name || user.email.split('@')[0] || user.email,
      Email: user.email,
      Role: user.role,
      Status: user.is_active ? 'Active' : 'Suspended',
      Created: new Date(createdAt).toISOString().slice(0, 10),
    }];
  });

  return { reportType: 'system-users', from, to, columns, rows };
}
