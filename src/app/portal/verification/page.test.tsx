// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VerificationPage from '@/features/verification/pages/verification-page';

const { verifyRepositoryDocumentMock } = vi.hoisted(() => ({
  verifyRepositoryDocumentMock: vi.fn(),
}));

vi.mock('@/features/verification/integrity-api', () => ({
  verifyRepositoryDocument: verifyRepositoryDocumentMock,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('VerificationPage', () => {
  it.each([
    ['AUTHENTIC', true, true, 'Match'],
    ['TAMPERED', false, true, 'Mismatch'],
    ['SNAPSHOT_COMPROMISED', false, false, 'Trusted snapshot is compromised'],
    ['NOT_ANCHORED', false, false, 'Document is not anchored'],
    ['VERIFICATION_UNAVAILABLE', false, true, 'Integrity status unavailable'],
  ])('preserves the %s verdict on the verification center screen', async (status, isAuthentic, baselineTrusted, heading) => {
    verifyRepositoryDocumentMock.mockResolvedValue({
      document_id: 'document-123', status, is_authentic: isAuthentic, baseline_trusted: baselineTrusted,
      onchain_hash: '0xabc', current_hash: '0xdef', snapshot_hash: '0xabc',
    });
    render(<VerificationPage />);

    fireEvent.change(screen.getByLabelText('Repository document ID'), { target: { value: 'document-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check integrity' }));

    expect(await screen.findByText(heading)).toBeTruthy();
  });

  it('fails closed when AUTHENTIC conflicts with is_authentic=false', async () => {
    verifyRepositoryDocumentMock.mockResolvedValue({
      document_id: 'document-123', status: 'AUTHENTIC', is_authentic: false, baseline_trusted: true,
    });
    render(<VerificationPage />);

    fireEvent.change(screen.getByLabelText('Repository document ID'), { target: { value: 'document-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check integrity' }));

    expect(await screen.findByText('Integrity status unavailable')).toBeTruthy();
  });

  it('explains the 404 response as not found or not anchored rather than as a service failure', async () => {
    const notFound = Object.assign(new Error('API error: 404'), { status: 404 });
    verifyRepositoryDocumentMock.mockRejectedValue(notFound);
    render(<VerificationPage />);

    fireEvent.change(screen.getByLabelText('Repository document ID'), { target: { value: 'document-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check integrity' }));

    expect(await screen.findByText(/document not found or has no on-chain record/i)).toBeTruthy();
    expect(screen.queryByText('Integrity status unavailable')).toBeNull();
  });

  it('renders the unavailable integrity status when the verification request is rejected', async () => {
    verifyRepositoryDocumentMock.mockRejectedValue(new Error('Network unavailable'));
    render(<VerificationPage />);

    fireEvent.change(screen.getByLabelText('Repository document ID'), { target: { value: 'document-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check integrity' }));

    expect(await screen.findByText('Integrity status unavailable')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('could not be retrieved');
  });
});
