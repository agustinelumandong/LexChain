import type { DemoIntegrityState } from "@/features/documents";

type IntegrityRecord = {
  status?: string;
  baseline_trusted?: boolean;
  onchain_hash?: string | null;
  is_authentic?: boolean;
} | null | undefined;

export type IntegrityUiState = 'recorded' | 'not_recorded' | 'unavailable' | 'match' | 'match_untrusted_snapshot' | 'mismatch' | 'file_missing' | 'snapshot_compromised' | 'not_anchored' | 'not_found_or_unanchored';

export type IntegrityUiInput = {
  record: IntegrityRecord;
  requestFailed: boolean;
  notFoundOrUnanchored?: boolean;
};

export function getIntegrityUiState({ record, requestFailed, notFoundOrUnanchored }: IntegrityUiInput): IntegrityUiState {
  if (requestFailed) return 'unavailable';
  if (notFoundOrUnanchored) return 'not_found_or_unanchored';
  if (!record) return 'not_recorded';
  if (record.status === 'AUTHENTIC') return record.is_authentic ? (record.baseline_trusted === false ? 'match_untrusted_snapshot' : 'match') : 'unavailable';
  if (record.status === 'FILE_MISSING') return record.is_authentic === false ? 'file_missing' : 'unavailable';
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
  if (state === 'snapshot_compromised' || state === 'match_untrusted_snapshot' || state === 'file_missing') return 'mismatch';
  return state === 'mismatch' ? 'mismatch' : 'unavailable';
}

export function shortenIntegrityHash(hash: string): string {
  return hash.length > 20 ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : hash;
}

export function getBaseSepoliaTransactionUrl(hash: string): string | null {
  const transactionHash = hash.replace(/^(?:0x)+/i, '');
  return transactionHash.length === 64 && /^[a-f\d]+(?![\s\S])/i.test(transactionHash)
    ? `https://sepolia.basescan.org/tx/0x${transactionHash}`
    : null;
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
    description: 'The current file differs from the blockchain record or is missing, and the stored reference is compromised.',
    tone: 'warning',
  },
  match_untrusted_snapshot: {
    label: 'File matches, but saved reference needs attention',
    description: 'The current file matches the blockchain record, but the stored snapshot is not trusted.',
    tone: 'warning',
  },
  file_missing: {
    label: 'Document file is missing',
    description: 'The stored document file was deleted and is no longer available for comparison.',
    tone: 'warning',
  },
  not_anchored: {
    label: 'Document is not anchored',
    description: 'This document has no saved integrity record.',
    tone: 'neutral',
  },
  not_found_or_unanchored: {
    label: 'Document not found or has no on-chain record',
    description: 'This document could not be found or has not been finalized.',
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
