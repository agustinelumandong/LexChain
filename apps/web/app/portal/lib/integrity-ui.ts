type IntegrityRecord = { data_hash?: string | null; is_verified?: boolean | null } | null | undefined;

export type IntegrityUiState = 'recorded' | 'not_recorded' | 'unavailable' | 'match' | 'mismatch';

export type IntegrityUiInput = {
  record: IntegrityRecord;
  requestFailed: boolean;
};

export function getIntegrityUiState({ record, requestFailed }: IntegrityUiInput): IntegrityUiState {
  if (requestFailed) return 'unavailable';
  if (!record) return 'not_recorded';
  if (record.is_verified === false) return 'mismatch';
  return record.data_hash ? 'recorded' : 'not_recorded';
}

export type IntegrityResult = {
  label: 'Match' | 'Mismatch' | 'No Record';
  description: string;
  tone: 'success' | 'warning' | 'neutral';
};

export type IntegrityUiCopy = {
  label: string;
  description: string;
  tone: IntegrityResult['tone'];
};

const integrityUiCopy: Record<IntegrityUiState, IntegrityUiCopy> = {
  recorded: {
    label: 'Match',
    description: 'The returned repository record reports a hash match.',
    tone: 'success',
  },
  not_recorded: {
    label: 'No Record',
    description: 'No repository integrity record was returned for this identifier.',
    tone: 'neutral',
  },
  unavailable: {
    label: 'Integrity status unavailable',
    description: 'The repository integrity record could not be retrieved. Please retry.',
    tone: 'warning',
  },
  match: {
    label: 'Match',
    description: 'The returned repository record reports a hash match.',
    tone: 'success',
  },
  mismatch: {
    label: 'Mismatch',
    description: 'The returned repository record reports a hash mismatch.',
    tone: 'warning',
  },
};

export function getIntegrityUiCopy(state: IntegrityUiState): IntegrityUiCopy {
  return integrityUiCopy[state];
}

export const INTEGRITY_SAFETY_MESSAGE =
  'This checks file integrity only. It does not determine legal validity, notarization, or enforceability.';

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
