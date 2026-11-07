// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TamperReports } from './tamper-reports';
import { portalFetch, portalRequest } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({ portalFetch: vi.fn(), portalRequest: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('loads again when a new report is generated', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 0, reports: [] });
  const { rerender } = render(<TamperReports generateRequest={1} />);
  expect(await screen.findByText('No open integrity reports')).toBeTruthy();
  rerender(<TamperReports generateRequest={2} />);
  await vi.waitFor(() => expect(portalFetch).toHaveBeenCalledTimes(2));
});

it('shows open reports and partial restore outcomes after confirmation', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 1, reports: [{ document_id: 'doc-1', file_name: 'Deed.pdf', status: 'AUTHENTIC', restorable: false, blocked_reason: 'archive_missing', changes: [{ kind: 'metadata', field: 'doc_no' }] }] });
  vi.mocked(portalRequest).mockResolvedValue(Response.json({ restored: [{ document_id: 'doc-1', restored: true, unrepaired: ['snapshot.signed_copy_id'] }], failed: [{ document_id: 'doc-2', message: 'Archive missing' }] }));
  render(<TamperReports />);
  fireEvent.click(screen.getByRole('button', { name: 'Check reports' }));
  expect(await screen.findByText('Restore unavailable: archive missing')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Deed.pdf' }).getAttribute('href')).toBe('/portal/documents/doc-1/verify');
  fireEvent.click(screen.getByRole('button', { name: 'Restore all' }));
  expect(portalRequest).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm restore all' }));
  const result = await screen.findByRole('region', { name: 'Restore all result' });
  expect(within(result).getByText(/Needs database backup: snapshot.signed_copy_id/)).toBeTruthy();
  expect(within(result).getByText(/doc-2: Archive missing/)).toBeTruthy();
  expect(portalRequest).toHaveBeenCalledTimes(1);
});

it('refreshes the list and warns that a failed request may have changed documents', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 1, reports: [{ document_id: 'doc-1', status: 'TAMPERED', restorable: true }] });
  vi.mocked(portalRequest).mockRejectedValue(new Error('Network error'));
  render(<TamperReports />);
  fireEvent.click(screen.getByRole('button', { name: 'Check reports' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Restore all' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm restore all' }));
  expect((await screen.findByRole('alert')).textContent).toContain('Some documents may have changed');
  expect(portalFetch).toHaveBeenCalledTimes(2);
  expect(portalRequest).toHaveBeenCalledTimes(1);
});
