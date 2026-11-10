// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TamperReports } from './tamper-reports';
import { portalFetch, portalRequest } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({ portalFetch: vi.fn(), portalRequest: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('makes the entire active report card a link to verification', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 1, reports: [{ document_id: 'doc-1', file_name: 'Deed.pdf', status: 'TAMPERED', restorable: true, changes: [{ kind: 'metadata', field: 'file_name' }] }] });
  render(<TamperReports generateRequest={1} />);
  const link = await screen.findByRole('link', { name: 'Deed.pdf' });
  expect(link.getAttribute('href')).toBe('/portal/documents/doc-1/verify');
  expect(link.className).toContain('after:absolute');
  expect(link.className).toContain('after:inset-0');
  expect(link.closest('li')?.className).toContain('relative');
});

it('identifies changed analysis and its affected fields', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 1, reports: [{ document_id: 'doc-1', file_name: 'Deed.pdf', status: 'AUTHENTIC', restorable: true, changes: [{ kind: 'analysis', field: 'approved_text' }, { kind: 'analysis', field: 'insight.risk_flags' }] }] });
  render(<TamperReports generateRequest={1} />);
  expect(await screen.findByText('Analysis changed: Approved text, Risk flags')).toBeTruthy();
});

it('explains when analysis could not be checked', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 1, reports: [{ document_id: 'doc-1', status: 'AUTHENTIC', restorable: false, blocked_reason: 'analysis_unreadable', changes: [] }] });
  render(<TamperReports generateRequest={1} />);
  expect(await screen.findByText('Analysis could not be checked, so restoration is unavailable.')).toBeTruthy();
});

it('places the restore action in the supplied header after reports load', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 1, reports: [{ document_id: 'doc-1', status: 'TAMPERED', restorable: true }] });
  const target = document.createElement('div');
  document.body.appendChild(target);
  render(<TamperReports generateRequest={1} actionTarget={target} />);
  await screen.findByRole('button', { name: 'Restore all' });
  expect(within(target).getByRole('button', { name: 'Restore all' })).toBeTruthy();
  target.remove();
});

it('loads again when a new report is generated', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 0, reports: [] });
  const { rerender } = render(<TamperReports generateRequest={1} />);
  expect(await screen.findByText('No open integrity reports')).toBeTruthy();
  rerender(<TamperReports generateRequest={2} />);
  await vi.waitFor(() => expect(portalFetch).toHaveBeenCalledTimes(2));
});

it('shows a loading state instead of the previous empty result during refresh', async () => {
  let finishRefresh!: (value: { total: number; reports: [] }) => void;
  vi.mocked(portalFetch).mockResolvedValueOnce({ total: 0, reports: [] }).mockReturnValueOnce(new Promise((resolve) => { finishRefresh = resolve; }));
  render(<TamperReports />);
  fireEvent.click(screen.getByRole('button', { name: 'Check reports' }));
  expect(await screen.findByText('No open integrity reports')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh reports' }));
  expect(screen.getByRole('status').textContent).toContain('Checking integrity reports');
  expect(screen.queryByText('No open integrity reports')).toBeNull();
  await act(async () => finishRefresh({ total: 0, reports: [] }));
  expect(await screen.findByText('No open integrity reports')).toBeTruthy();
});

it('keeps the latest result when report checks finish out of order', async () => {
  let finishFirst!: (value: { total: number; reports: [] }) => void;
  vi.mocked(portalFetch).mockReturnValueOnce(new Promise((resolve) => { finishFirst = resolve; })).mockResolvedValueOnce({ total: 1, reports: [{ document_id: 'doc-1', file_name: 'Deed.pdf', status: 'TAMPERED', restorable: true }] });
  const { rerender } = render(<TamperReports generateRequest={1} />);
  rerender(<TamperReports generateRequest={2} />);
  expect(await screen.findByText('Deed.pdf')).toBeTruthy();
  await act(async () => finishFirst({ total: 0, reports: [] }));
  expect(screen.getByText('Deed.pdf')).toBeTruthy();
  expect(screen.queryByText('No open integrity reports')).toBeNull();
});

it('shows open reports and partial restore outcomes after confirmation', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 1, reports: [{ document_id: 'doc-1', file_name: 'Deed.pdf', status: 'AUTHENTIC', restorable: false, blocked_reason: 'archive_missing', changes: [{ kind: 'metadata', field: 'doc_no' }] }] });
  vi.mocked(portalRequest).mockResolvedValue(Response.json({ restored: [{ document_id: 'doc-1', restored: true, unrepaired: ['snapshot.signed_copy_id'] }], failed: [{ document_id: 'doc-2', message: 'Archive missing' }] }));
  render(<TamperReports />);
  fireEvent.click(screen.getByRole('button', { name: 'Check reports' }));
  expect(await screen.findByText('Cannot be restored: the original copy is missing.')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Deed.pdf' }).getAttribute('href')).toBe('/portal/documents/doc-1/verify');
  fireEvent.click(screen.getByRole('button', { name: 'Restore all' }));
  expect(portalRequest).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm restore all' }));
  const result = await screen.findByRole('region', { name: 'Restore all result' });
  expect(within(result).getByText('Needs manual recovery: Signed copy ID')).toBeTruthy();
  expect(within(result).getByText('Partly restored')).toBeTruthy();
  expect(within(result).getByText('Archive missing')).toBeTruthy();
  expect(within(result).getByRole('heading', { name: 'Restore finished: 2 need attention' })).toBeTruthy();
  expect(portalRequest).toHaveBeenCalledTimes(1);
});

it('names restored documents and repaired fields in plain language', async () => {
  const documentId = '8d77f49e-729d-49dd-bc75-f41def569108';
  vi.mocked(portalFetch).mockResolvedValueOnce({ total: 1, reports: [{ document_id: documentId, file_name: 'Deed.pdf', status: 'TAMPERED', restorable: true }] }).mockResolvedValue({ total: 0, reports: [] });
  vi.mocked(portalRequest).mockResolvedValue(Response.json({ restored: [{ document_id: documentId, restored: true, repaired: [{ record: 'metadata', field: 'file_name', old: 'x', new: 'Deed.pdf' }] }], failed: [] }));
  render(<TamperReports />);
  fireEvent.click(screen.getByRole('button', { name: 'Check reports' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Restore all' }));
  expect(screen.getByRole('dialog').textContent).not.toMatch(/backend|database/i);
  fireEvent.click(screen.getByRole('button', { name: 'Confirm restore all' }));
  const result = await screen.findByRole('region', { name: 'Restore all result' });
  expect(within(result).getByRole('heading', { name: 'Restore complete' })).toBeTruthy();
  expect(within(result).getByRole('link', { name: 'Deed.pdf' }).getAttribute('href')).toBe(`/portal/documents/${documentId}/verify`);
  expect(within(result).getByText('Fixed: File name')).toBeTruthy();
  expect(result.textContent).not.toContain(documentId);
  expect(result.textContent).not.toContain('metadata.');
  fireEvent.click(within(result).getByRole('button', { name: 'Dismiss restore results' }));
  expect(screen.queryByRole('region', { name: 'Restore all result' })).toBeNull();
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

it('recovers a deleted document after confirmation and reports a missing PDF', async () => {
  vi.mocked(portalFetch).mockResolvedValueOnce({ total: 1, reports: [{ document_id: 'doc-1', file_name: 'Deed.pdf', status: 'DELETED', restorable: true }] }).mockResolvedValue({ total: 0, reports: [] });
  vi.mocked(portalRequest).mockResolvedValue(Response.json({ document_id: 'doc-1', file_name: 'Deed.pdf', file_present: false, recovered_at: '2026-11-07T00:00:00Z' }));
  render(<TamperReports />);
  fireEvent.click(screen.getByRole('button', { name: 'Check reports' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Recover Deed.pdf' }));
  expect(portalRequest).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm recovery' }));
  expect(await screen.findByText(/Deed.pdf.*PDF is missing/)).toBeTruthy();
  expect(portalRequest).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent('/documents/tamper-reports/doc-1/recover')), { method: 'POST' });
});

it('shows recovered documents from restore all, including unknown PDF availability', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 1, reports: [{ document_id: 'doc-1', status: 'DELETED', restorable: true }] });
  vi.mocked(portalRequest).mockResolvedValue(Response.json({ restored: [], failed: [], recovered: [{ document_id: 'doc-1', file_present: null, recovered_at: '2026-11-07T00:00:00Z' }] }));
  render(<TamperReports />);
  fireEvent.click(screen.getByRole('button', { name: 'Check reports' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Restore all' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm restore all' }));
  expect(await screen.findByText('PDF availability could not be confirmed.')).toBeTruthy();
  expect(screen.queryByText('No documents needed restoring')).toBeNull();
});

it('explains when a deleted document needs a backup and does not offer recovery', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 1, reports: [{ document_id: 'doc-1', status: 'DELETED', restorable: false, blocked_reason: 'backup_needed' }] });
  render(<TamperReports />);
  fireEvent.click(screen.getByRole('button', { name: 'Check reports' }));
  expect(await screen.findByText('This document needs manual recovery.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Recover Untitled document/ })).toBeNull();
});

it('shows a recovery failure and refreshes the report without retrying', async () => {
  vi.mocked(portalFetch).mockResolvedValue({ total: 1, reports: [{ document_id: 'doc-1', status: 'DELETED', restorable: true }] });
  vi.mocked(portalRequest).mockRejectedValue(new Error('No saved copy; use a backup.'));
  render(<TamperReports />);
  fireEvent.click(screen.getByRole('button', { name: 'Check reports' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Recover Untitled document' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm recovery' }));
  expect((await screen.findByRole('alert')).textContent).toContain('No saved copy; use a backup.');
  expect(portalFetch).toHaveBeenCalledTimes(2);
  expect(portalRequest).toHaveBeenCalledTimes(1);
});
