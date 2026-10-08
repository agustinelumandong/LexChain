// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PortalAuditLogsPage from './audit-logs-page';

const { adminFetchMock } = vi.hoisted(() => ({ adminFetchMock: vi.fn() }));
vi.mock('@/features/admin/server', () => ({ adminFetch: adminFetchMock }));
vi.mock('@/features/access/server', () => ({ requireDocumentIssuerPage: vi.fn() }));

afterEach(cleanup);

describe('PortalAuditLogsPage', () => {
  it('shows audit history as unavailable without requesting an unsupported endpoint', async () => {
    const page = await PortalAuditLogsPage();
    render(page);

    expect(screen.getByRole('heading', { name: 'Audit history unavailable' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('not available in this portal yet');
    expect(adminFetchMock).not.toHaveBeenCalled();
  });
});
