// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DocumentWorkspace } from './document-workspace';

const document = {
  document_id: 'doc-101',
  document_number: 101,
  file_name: 'service-agreement.pdf',
  status: 'COMPLETED',
  on_chain: true,
  content_type: 'application/pdf',
  storage_url: 'https://files.example/service-agreement.pdf',
  summary: 'A summary generated from the document.',
  labels: ['Service agreement'],
  entities: [{ name: 'Acme Legal' }],
  risk_flags: [{ severity: 'review', detail: 'Payment term' }],
};

describe('DocumentWorkspace', () => {
  afterEach(cleanup);

  it('keeps original files, derived insights, and integrity data in separate tabs', () => {
    render(<DocumentWorkspace document={document} role="issuer" chain={{ data_hash: '0xabc', tx_hash: '0xdef', onchain_timestamp: 1_700_000_000 }} />);

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
  });

  it('explains unavailable data without inventing controls or restricted workflow actions', () => {
    render(<DocumentWorkspace document={{ ...document, storage_url: '', summary: null, labels: [], entities: [], risk_flags: [], on_chain: false }} role="issuer" />);

    fireEvent.click(screen.getByRole('tab', { name: 'Original PDF' }));
    expect(screen.getByText(/original PDF is not available/i)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /original PDF/i })).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: 'Insights' }));
    expect(screen.getByText(/no derived insights are available/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'Blockchain' }));
    expect(screen.getByText(/no blockchain record is available/i)).toBeTruthy();
    expect(screen.queryByText(/Anchor to Blockchain|Finali[sz]e|Confirm record/i)).toBeNull();
  });
});
