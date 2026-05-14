"use dom";

import { useRef, useState } from 'react';

type PdfPayload = {
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
};

type PublicVerifyResult = {
  status: string;
  confidence: number;
  file_name?: string | null;
  notarized_at?: number | null;
  notarized_by?: string | null;
  tx_hash?: string | null;
  matched_at: string;
};

type PublicVerifierDomProps = {
  verifyPdf: (file: PdfPayload) => Promise<PublicVerifyResult>;
  dom?: import('expo/dom').DOMProps;
};

function isPdfFile(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function formatFileSize(fileSize?: number) {
  if (!fileSize || Number.isNaN(fileSize)) {
    return '';
  }

  if (fileSize >= 1024 * 1024) {
    return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
}

function formatDate(value?: string | number | null) {
  if (!value) {
    return 'Not available';
  }

  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatHash(value?: string | null) {
  if (!value) {
    return 'Not available';
  }

  if (value.length <= 28) {
    return value;
  }

  return `${value.slice(0, 14)}...${value.slice(-12)}`;
}

function normalizeStatus(value: string) {
  const status = value.toLowerCase();

  if (status === 'match' || status === 'verified' || status === 'valid') {
    return 'Verified';
  }

  if (status === 'pending') {
    return 'Pending';
  }

  return 'Invalid';
}

export default function PublicVerifierDom({ verifyPdf }: PublicVerifierDomProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicVerifyResult | null>(null);

  const handleFile = async (file?: File) => {
    if (!file || isPending) {
      return;
    }

    if (!isPdfFile(file)) {
      setError('Only PDF files can be verified.');
      return;
    }

    setError(null);
    setResult(null);
    setIsPending(true);
    setSelectedFileName(file.name);
    setSelectedFileSize(formatFileSize(file.size));

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const response = await verifyPdf({
        name: file.name,
        mimeType: file.type || 'application/pdf',
        size: file.size,
        dataUrl,
      });

      setResult(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to verify uploaded PDF.',
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main style={styles.screen}>
      <section style={styles.card}>
        <div style={styles.brand}>LexChain</div>
        <h1 style={styles.title}>Public verifier</h1>
        <p style={styles.subtitle}>
          Upload a PDF and LexChain checks whether it matches a notarized record.
        </p>

        <div
          role="button"
          tabIndex={0}
          aria-disabled={isPending}
          aria-label="Choose or drop one PDF file to verify"
          onClick={() => {
            if (!isPending) {
              inputRef.current?.click();
            }
          }}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !isPending) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);

            if (event.dataTransfer.files.length > 1) {
              setError('Drop one PDF file only.');
              return;
            }

            void handleFile(event.dataTransfer.files[0]);
          }}
          style={{
            ...styles.uploadBox,
            ...(isDragging ? styles.uploadBoxActive : null),
            ...(isPending ? styles.uploadBoxPending : null),
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            disabled={isPending}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              void handleFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = '';
            }}
            style={{ display: 'none' }}
          />

          <div style={styles.uploadIcon} aria-hidden>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M14 2v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M12 18v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="m9 15 3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div style={styles.uploadCopy}>
            <div style={styles.uploadTitle}>
              {selectedFileName ?? 'Choose PDF to verify'}
            </div>
            <div style={styles.uploadText}>
              {selectedFileSize || 'Click to browse or drag and drop one PDF file here.'}
            </div>
          </div>
        </div>

        {isPending ? (
          <div style={styles.stateBox}>
            <div style={styles.stateTitle}>Verifying uploaded document...</div>
            <div style={styles.stateText}>OCR, hash comparison, and blockchain lookup are running.</div>
          </div>
        ) : null}

        {error ? (
          <div style={styles.errorBox}>
            <div style={styles.errorTitle}>Unable to verify upload</div>
            <div style={styles.errorText}>{error}</div>
          </div>
        ) : null}

        {result ? (
          <section style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <div>
                <div style={styles.resultEyebrow}>LexChain Verification</div>
                <h2 style={styles.resultTitle}>
                  {result.file_name ?? selectedFileName ?? 'Uploaded PDF'}
                </h2>
              </div>
              <div style={styles.statusPill}>{normalizeStatus(result.status)}</div>
            </div>

            <div style={styles.rows}>
              <ResultRow label="Confidence" value={`${Math.round(result.confidence * 100)}%`} />
              <ResultRow label="Matched" value={formatDate(result.matched_at)} />
              <ResultRow label="Notarized" value={formatDate(result.notarized_at)} />
              <ResultRow label="Notarized by" value={result.notarized_by ?? 'Not available'} />
              <ResultRow label="Transaction" value={formatHash(result.tx_hash)} />
            </div>
          </section>
        ) : null}

        <a href="/" style={styles.homeLink}>Back to website</a>
      </section>
    </main>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: '#F7FAFD',
    padding: 20,
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxSizing: 'border-box' as const,
  },
  card: {
    width: '100%',
    maxWidth: 760,
    borderRadius: 24,
    background: '#FFFFFF',
    border: '1px solid #DDE8F4',
    padding: 28,
    display: 'grid',
    gap: 18,
    boxSizing: 'border-box' as const,
  },
  brand: {
    color: '#0777F2',
    fontSize: 13,
    lineHeight: '16px',
    fontWeight: 900,
    textTransform: 'uppercase' as const,
  },
  title: {
    margin: 0,
    color: '#0C2B49',
    fontSize: 30,
    lineHeight: '36px',
    fontWeight: 900,
  },
  subtitle: {
    margin: 0,
    color: '#6B7D92',
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 600,
  },
  uploadBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    minHeight: 132,
    padding: 16,
    borderRadius: 18,
    border: '1px solid #DDE8F4',
    background: '#F7FBFF',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 160ms ease, background 160ms ease, opacity 160ms ease',
    boxSizing: 'border-box' as const,
  },
  uploadBoxActive: {
    borderColor: '#0777F2',
    background: '#EAF5FF',
  },
  uploadBoxPending: {
    cursor: 'wait',
    opacity: 0.72,
  },
  uploadIcon: {
    display: 'grid',
    placeItems: 'center',
    width: 52,
    height: 52,
    flex: '0 0 52px',
    borderRadius: 14,
    background: '#FFFFFF',
    color: '#0777F2',
    boxShadow: '0 1px 0 rgba(12, 43, 73, 0.05)',
  },
  uploadCopy: {
    display: 'grid',
    gap: 4,
    minWidth: 0,
  },
  uploadTitle: {
    color: '#0C2B49',
    fontSize: 15,
    lineHeight: '20px',
    fontWeight: 900,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  uploadText: {
    color: '#6B7D92',
    fontSize: 12,
    lineHeight: '17px',
    fontWeight: 600,
  },
  stateBox: {
    borderRadius: 16,
    background: '#F0F7FF',
    border: '1px solid #CFE5FF',
    padding: 14,
    display: 'grid',
    gap: 4,
  },
  stateTitle: {
    color: '#0C2B49',
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 900,
  },
  stateText: {
    color: '#6B7D92',
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 600,
  },
  errorBox: {
    borderRadius: 16,
    background: '#FFF4F4',
    border: '1px solid #FFD1D1',
    padding: 14,
    display: 'grid',
    gap: 4,
  },
  errorTitle: {
    color: '#7A1F1F',
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 900,
  },
  errorText: {
    color: '#7A1F1F',
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 600,
  },
  resultCard: {
    width: '100%',
    borderRadius: 22,
    background: '#FFFFFF',
    border: '1px solid #DDE8F4',
    padding: 20,
    display: 'grid',
    gap: 18,
    boxShadow: '0 10px 24px rgba(12, 43, 73, 0.08)',
    boxSizing: 'border-box' as const,
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap' as const,
  },
  resultEyebrow: {
    color: '#0777F2',
    fontSize: 12,
    lineHeight: '14px',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
  },
  resultTitle: {
    margin: '6px 0 0',
    color: '#0C2B49',
    fontSize: 24,
    lineHeight: '30px',
    fontWeight: 800,
  },
  statusPill: {
    borderRadius: 999,
    background: '#EAF5FF',
    color: '#0777F2',
    padding: '8px 12px',
    fontSize: 12,
    lineHeight: '14px',
    fontWeight: 900,
    textTransform: 'uppercase' as const,
  },
  rows: {
    borderTop: '1px solid #DDE8F4',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 18,
    borderBottom: '1px solid #DDE8F4',
    padding: '14px 0',
  },
  rowLabel: {
    color: '#6B7D92',
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 700,
  },
  rowValue: {
    flex: 1,
    color: '#0C2B49',
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 700,
    textAlign: 'right' as const,
    wordBreak: 'break-word' as const,
  },
  homeLink: {
    color: '#0777F2',
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 800,
    textAlign: 'center' as const,
    textDecoration: 'none',
  },
};
