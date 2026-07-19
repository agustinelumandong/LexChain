// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { IntegrityResult } from '../components/integrity-result';
import {
  INTEGRITY_SAFETY_MESSAGE,
  getIntegrityResult,
} from './integrity-ui';

const matchingRecord = {
  document_id: 'document-123',
  onchain_document_id: 'chain-document-456',
  data_hash: 'data-hash',
  tx_hash: 'transaction-hash',
  onchain_timestamp: 1_700_000_000,
  issued_by: 'issuer-address',
  verified_at: '2026-07-19T00:00:00Z',
  transacttion_link: 'https://example.com/transaction',
  is_verified: true,
};

afterEach(cleanup);

describe('getIntegrityResult', () => {
  it('labels a verified repository response as Match', () => {
    expect(getIntegrityResult({ is_verified: true })).toMatchObject({ label: 'Match' });
  });

  it('labels an unverified repository response as Mismatch', () => {
    expect(getIntegrityResult({ is_verified: false })).toMatchObject({ label: 'Mismatch' });
  });

  it('labels a missing repository response as No Record', () => {
    expect(getIntegrityResult(undefined)).toMatchObject({ label: 'No Record' });
  });
});

it('uses integrity-only safety wording without legal or retention claims', () => {
  expect(INTEGRITY_SAFETY_MESSAGE).toContain('integrity');
  expect(INTEGRITY_SAFETY_MESSAGE).toContain('does not determine legal validity');
  expect(INTEGRITY_SAFETY_MESSAGE).toContain('does not upload or retain a public file');
});

describe('IntegrityResult', () => {
  it('renders No Record when the repository response is missing', () => {
    render(createElement(IntegrityResult));

    expect(screen.getByText('No Record')).toBeTruthy();
    expect(screen.getByText(/no repository integrity record was returned/i)).toBeTruthy();
  });

  it('renders a Match result for a matching repository record', () => {
    render(createElement(IntegrityResult, { record: matchingRecord }));

    expect(screen.getByText('Match')).toBeTruthy();
    expect(screen.getByText(/reports a hash match/i)).toBeTruthy();
    expect(screen.getByText('document-123')).toBeTruthy();
  });

  it('renders a Mismatch result for a non-matching repository record', () => {
    render(createElement(IntegrityResult, { record: { ...matchingRecord, is_verified: false } }));

    expect(screen.getByText('Mismatch')).toBeTruthy();
    expect(screen.getByText(/reports a hash mismatch/i)).toBeTruthy();
  });

  it('does not render legal, fraud, anchoring, or finalization controls', () => {
    render(createElement(IntegrityResult, { record: matchingRecord }));

    expect(screen.getByText(/does not determine legal validity/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /legal|fraud|anchor|finali[sz]/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /legal|fraud|anchor|finali[sz]/i })).toBeNull();
  });
});
