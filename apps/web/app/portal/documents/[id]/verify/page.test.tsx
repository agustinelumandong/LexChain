// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DocumentVerifyPage from './page';

vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'doc-1' }) }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('DocumentVerifyPage', () => {
  it('runs the live document verification endpoint only when requested', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      status: 'AUTHENTIC', is_authentic: true, message: 'Document matches the anchored hash.',
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(<DocumentVerifyPage />);
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Verify integrity' }));

    expect(await screen.findByText('Document is authentic')).toBeTruthy();
    expect(fetchMock.mock.calls[0]?.[0]).toContain(encodeURIComponent('/documents/doc-1/verify'));
  });

  it('renders the server tamper report instead of a generic warning', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'TAMPERED', is_authentic: false, message: 'Hash mismatch.', tamper_report: { total_changes: 1, critical_changes: 1, segments: [{ severity: 'critical', reason: 'Amount changed', original_text: 'PHP 500', current_text: 'PHP 50' }] } })));
    render(<DocumentVerifyPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Verify integrity' }));
    expect(await screen.findByText('Document was tampered with')).toBeTruthy();
    expect(screen.getByText(/Amount changed/)).toBeTruthy();
  });
});
