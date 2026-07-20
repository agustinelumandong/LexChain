// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocumentWorkspace } from './document-workspace';

const document = {
  document_id: 'doc-101',
  document_number: 101,
  file_name: 'service-agreement.pdf',
  status: 'COMPLETED',
  content_type: 'application/pdf',
  storage_url: 'https://files.example/service-agreement.pdf',
  summary: 'A summary generated from the document.',
  labels: ['Service agreement'],
  entities: [{ name: 'Acme Legal' }],
  risk_flags: [{ severity: 'review', detail: 'Payment term' }],
};

describe('DocumentWorkspace', () => {
  afterEach(cleanup);

  it('shows populated document metadata in the Overview tab', () => {
    render(<DocumentWorkspace document={document} role="issuer" integrityState="recorded" />);

    const overview = screen.getByRole('tabpanel');
    expect(within(overview).getByRole('heading', { name: 'Overview' })).toBeTruthy();
    expect(within(overview).getByText('Filename').nextElementSibling?.textContent).toBe('service-agreement.pdf');
    expect(within(overview).getByText('Reference').nextElementSibling?.textContent).toBe('101');
    expect(within(overview).getByText('Content type').nextElementSibling?.textContent).toBe('application/pdf');
    expect(within(overview).getByText('Lifecycle status').nextElementSibling?.textContent).toBe('COMPLETED');
    expect(within(overview).getByText('Integrity status').nextElementSibling?.textContent).toBe('Integrity record available');
  });

  it('marks missing Overview metadata as not supplied', () => {
    render(<DocumentWorkspace document={{ storage_url: null }} role="issuer" integrityState="not_recorded" />);

    const overview = screen.getByRole('tabpanel');
    expect(within(overview).getByText('Reference').nextElementSibling?.textContent).toBe('Not supplied');
    expect(within(overview).getByText('Content type').nextElementSibling?.textContent).toBe('Not supplied');
  });

  it('keeps original files, derived insights, and integrity data in separate tabs', () => {
    render(<DocumentWorkspace document={document} role="issuer" chain={{ data_hash: '0xabc', tx_hash: '0xdef', onchain_timestamp: 1_700_000_000 }} integrityState="recorded" />);

    expect(screen.getByRole('tab', { name: 'Overview' })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Original PDF' }));
    expect(screen.getByRole('link', { name: 'Open original PDF' }).getAttribute('href')).toBe(document.storage_url);
    expect(screen.getByRole('link', { name: 'Download original PDF' }).hasAttribute('download')).toBe(true);

    fireEvent.click(screen.getByRole('tab', { name: 'Insights' }));
    expect(screen.getByText(/AI-generated assistance/i)).toBeTruthy();
    expect(screen.getByText(/original document remains authoritative/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText(/supports integrity checking, not legal validity/i)).toBeTruthy();
    expect(screen.getByText('0xabc')).toBeTruthy();
    expect(screen.getByText('Integrity record available')).toBeTruthy();
  });

  it('explains unavailable data without inventing controls or restricted workflow actions', () => {
    render(<DocumentWorkspace document={{ ...document, storage_url: '', summary: null, labels: [], entities: [], risk_flags: [] }} role="issuer" integrityState="not_recorded" />);

    fireEvent.click(screen.getByRole('tab', { name: 'Original PDF' }));
    expect(screen.getByText(/original PDF is not available/i)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /original PDF/i })).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: 'Insights' }));
    expect(screen.getByText(/no derived insights are available/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText(/no blockchain record is available/i)).toBeTruthy();
    expect(screen.queryByText(/Anchor to Blockchain|Finali[sz]e|Confirm record/i)).toBeNull();
  });

  it('shows an unavailable integrity state with a retry action instead of a record claim', () => {
    const onRetry = vi.fn();
    render(<DocumentWorkspace document={document} role="issuer" integrityState="unavailable" onRetry={onRetry} />);

    expect(screen.getByText('Integrity status unavailable')).toBeTruthy();
    expect(screen.queryByText('Blockchain record available')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry integrity lookup' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders one-key insight objects as readable key-value details', () => {
    render(<DocumentWorkspace document={document} role="issuer" integrityState="recorded" />);

    fireEvent.click(screen.getByRole('tab', { name: 'Insights' }));
    expect(screen.getByText('name — Acme Legal')).toBeTruthy();
  });

  it.each(['Versions', 'Access', 'Activity'] as const)('explains the unavailable %s workspace section', (tab) => {
    render(<DocumentWorkspace document={document} role="issuer" integrityState="recorded" />);

    fireEvent.click(screen.getByRole('tab', { name: tab }));
    expect(screen.getByText('This workspace section will be available when its document data is connected.')).toBeTruthy();
  });
});
