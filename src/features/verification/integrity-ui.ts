import type { DemoIntegrityState } from "@/features/documents";

type IntegrityRecord = {
  status?: string;
  baseline_trusted?: boolean;
  onchain_hash?: string | null;
  is_authentic?: boolean;
} | null | undefined;

export type IntegrityUiState = 'recorded' | 'not_recorded' | 'unavailable' | 'match' | 'mismatch' | 'snapshot_compromised' | 'not_anchored' | 'not_found_or_unanchored';

export type IntegrityUiInput = {
  record: IntegrityRecord;
  requestFailed: boolean;
  notFoundOrUnanchored?: boolean;
};

export function getIntegrityUiState({ record, requestFailed, notFoundOrUnanchored }: IntegrityUiInput): IntegrityUiState {
  if (requestFailed) return 'unavailable';
  if (notFoundOrUnanchored) return 'not_found_or_unanchored';
  if (!record) return 'not_recorded';
  if (record.status === 'AUTHENTIC') return record.is_authentic ? 'match' : 'unavailable';
  if (record.status === 'TAMPERED') return record.is_authentic === false ? 'mismatch' : 'unavailable';
  if (record.status === 'SNAPSHOT_COMPROMISED') return 'snapshot_compromised';
  if (record.status === 'NOT_ANCHORED') return 'not_anchored';
  if (record.status === 'VERIFICATION_UNAVAILABLE') return 'unavailable';
  if (record.baseline_trusted === false) return 'snapshot_compromised';
  if (record.status) return 'unavailable';
  if (record.is_authentic === false) return 'mismatch';
  return record.onchain_hash ? 'recorded' : 'not_recorded';
}

export function getDemoIntegrityState(state: IntegrityUiState): DemoIntegrityState {
  if (state === 'recorded' || state === 'match') return 'match';
  if (state === 'not_recorded' || state === 'not_anchored' || state === 'not_found_or_unanchored') return 'not-recorded';
  if (state === 'snapshot_compromised') return 'mismatch';
  return state === 'mismatch' ? 'mismatch' : 'unavailable';
}

export function shortenIntegrityHash(hash: string): string {
  return hash.length > 20 ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : hash;
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
  snapshot_compromised: {
    label: 'Trusted snapshot is compromised',
    description: 'The stored original could not be trusted as a baseline, so this result does not claim the current file was tampered with.',
    tone: 'warning',
  },
  not_anchored: {
    label: 'Document is not anchored',
    description: 'The backend reports that this document has no on-chain integrity record.',
    tone: 'neutral',
  },
  not_found_or_unanchored: {
    label: 'Document not found or has no on-chain record',
    description: 'The backend could not find this document or it has not been anchored.',
    tone: 'neutral',
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

  if (record.onchain_hash && record.is_authentic !== false) {
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
