// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { NotificationToasts } from './notification-toasts';

const { notify, notifyError, push } = vi.hoisted(() => ({ notify: vi.fn(), notifyError: vi.fn(), push: vi.fn() }));
vi.mock('sonner', () => ({ toast: { info: notify, error: notifyError } }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('collapses lengthy notification details while keeping the full message available', () => {
  const { rerender } = render(<NotificationToasts notifications={[]} />);
  const body = 'Technical details '.repeat(30);
  const notice = { id: 'long', type: 'document_recorded' as const, title: 'Anchor replaced', body, is_read: false, event_metadata: {}, created_at: '2026-01-01' };
  rerender(<NotificationToasts notifications={[notice]} />);
  const options = notify.mock.calls[0][1];
  render(options.description);
  const summary = screen.getByText('Show details');
  expect(summary.closest('details')?.open).toBe(false);
  expect(screen.getByText(body.trim())).toBeTruthy();
  fireEvent.click(summary);
  expect(summary.closest('details')?.open).toBe(true);
  expect(options.duration).toBe(Infinity);
});

it('only announces newly arrived unread notifications and opens safe destinations', () => {
  const old = { id: 'old', type: 'document_recorded' as const, title: 'Old', body: 'Earlier', is_read: false, event_metadata: { document_id: 'doc-1' }, created_at: '2026-01-01' };
  const fresh = { ...old, id: 'new', title: 'Document ready', body: 'Ready to view' };
  const { rerender } = render(<NotificationToasts notifications={undefined} />);
  rerender(<NotificationToasts notifications={[old]} />);
  expect(notify).not.toHaveBeenCalled();
  rerender(<NotificationToasts notifications={[fresh, old]} />);
  expect(notify).toHaveBeenCalledOnce();
  expect(notify).toHaveBeenCalledWith('Document ready', expect.objectContaining({ description: 'Ready to view' }));
  notify.mock.calls[0][1].action.onClick();
  expect(push).toHaveBeenCalledWith('/portal/documents/doc-1');
  rerender(<NotificationToasts notifications={[{ ...fresh, is_read: true }, old]} />);
  rerender(<NotificationToasts notifications={[fresh, old]} />);
  expect(notify).toHaveBeenCalledOnce();
});

it('does not offer an action for an unsafe destination or announce already-read items', () => {
  const { rerender } = render(<NotificationToasts notifications={[]} />);
  const notice = { id: 'new', type: 'document_recorded' as const, title: 'Update', body: 'Details', is_read: false, event_metadata: { document_id: '../unsafe' }, created_at: '2026-01-01' };
  rerender(<NotificationToasts notifications={[notice, { ...notice, id: 'read', is_read: true }]} />);
  expect(notify).toHaveBeenCalledOnce();
  expect(notify.mock.calls[0][1].action).toBeUndefined();
});

it.each(['document_failed', 'ecopy_delivery_failed'] as const)('uses an error toast for %s', (type) => {
  const { rerender } = render(<NotificationToasts notifications={[]} />);
  const notice = { id: 'failed', type, title: 'Processing failed', body: 'Please review', is_read: false, event_metadata: { document_id: 'doc-1' }, created_at: '2026-01-01' };
  rerender(<NotificationToasts notifications={[notice]} />);
  expect(notifyError).toHaveBeenCalledWith('Processing failed', expect.objectContaining({ description: 'Please review' }));
  expect(notify).not.toHaveBeenCalled();
});
