type IntegrityRecord = { is_verified?: boolean | null } | null | undefined;

export type IntegrityResult = {
  label: 'Match' | 'Mismatch' | 'No Record';
  description: string;
  tone: 'success' | 'warning' | 'neutral';
};

export const INTEGRITY_SAFETY_MESSAGE =
  'This result reports repository integrity only. It does not determine legal validity and does not upload or retain a public file.';

export function getIntegrityResult(record: IntegrityRecord): IntegrityResult {
  if (!record) {
    return {
      label: 'No Record',
      description: 'No repository integrity record was returned for this identifier.',
      tone: 'neutral',
    };
  }

  if (record.is_verified) {
    return {
      label: 'Match',
      description: 'The returned repository record reports a hash match.',
      tone: 'success',
    };
  }

  return {
    label: 'Mismatch',
    description: 'The returned repository record reports a hash mismatch.',
    tone: 'warning',
  };
}
