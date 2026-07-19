import { describe, expect, it } from 'vitest';
import {
  INTEGRITY_SAFETY_MESSAGE,
  getIntegrityResult,
} from './integrity-ui';

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
