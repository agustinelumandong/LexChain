'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

type VerificationResult = {
  status: string;
  is_authentic: boolean;
  message: string;
  tamper_report?: { total_changes?: number; critical_changes?: number; similarity?: number; segments?: Array<{ severity?: string; reason?: string; original_text?: string; current_text?: string }> } | null;
};

export default function DocumentVerifyPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<VerificationResult>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function verify() {
    setPending(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent(`/documents/${id}/verify`)}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Verification failed (${response.status})`);
      setResult(await response.json() as VerificationResult);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Verification could not be completed.');
    } finally {
      setPending(false);
    }
  }

  const status = result?.status;
  const unavailable = status === 'VERIFICATION_UNAVAILABLE';
  const authentic = status === 'AUTHENTIC' && result?.is_authentic;
  const notAnchored = status === 'NOT_ANCHORED';
  const compromised = status === 'SNAPSHOT_COMPROMISED';
  const tampered = status === 'TAMPERED';
  const heading = authentic ? 'Document is authentic' : unavailable ? 'Integrity status unavailable' : notAnchored ? 'Document is not anchored' : compromised ? 'Trusted snapshot is compromised' : tampered ? 'Document was tampered with' : 'Document integrity requires attention';

  return <div className="space-y-6">
    <Link href={`/portal/documents/${id}`} className="text-sm font-bold text-[#0985E7]">← Back to document</Link>
    <div><h1 className="text-2xl font-extrabold text-[#1B2559]">Document Verification</h1><p className="text-sm text-muted-foreground">Verify the stored document against its anchored hash.</p></div>
    <section className="rounded-[18px] border bg-white p-6 shadow">
      {!result && !error && <button type="button" onClick={verify} disabled={pending} className="rounded-full bg-[#0985E7] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{pending ? 'Verifying integrity…' : 'Verify integrity'}</button>}
      {error && <div role="alert" className="space-y-3"><ErrorIcon className="text-[#B77900]" sx={{ fontSize: 48 }} /><p className="font-bold">Integrity status unavailable</p><p className="text-sm text-muted-foreground">{error}</p><button type="button" onClick={verify} className="rounded-full border border-[#0985E7] px-5 py-3 text-sm font-black text-[#0985E7]">Retry verification</button></div>}
      {result && <div className="space-y-3 text-center"><>{authentic ? <CheckCircleIcon className="text-[#12A150]" sx={{ fontSize: 64 }} /> : <ErrorIcon className={unavailable || notAnchored ? 'text-[#B77900]' : 'text-[#D94B66]'} sx={{ fontSize: 64 }} />}</><p className={`text-xl font-extrabold ${authentic ? 'text-[#12A150]' : unavailable || notAnchored ? 'text-[#B77900]' : 'text-[#D94B66]'}`}>{heading}</p><p className="text-sm text-muted-foreground">{result.message}</p>{tampered && result.tamper_report && <div className="space-y-3 rounded-xl bg-red-50 p-4 text-left text-sm"><p className="font-bold">{result.tamper_report.total_changes ?? 0} change(s), {result.tamper_report.critical_changes ?? 0} critical</p>{result.tamper_report.segments?.map((segment, index) => <article key={index} className="rounded-lg bg-white p-3"><p className="font-bold text-red-700">{segment.severity ?? 'change'}: {segment.reason ?? 'Content changed'}</p>{segment.original_text && <p className="mt-2 text-slate-600"><s>{segment.original_text}</s></p>}{segment.current_text && <p className="mt-1 text-green-700">{segment.current_text}</p>}</article>)}</div>}{(unavailable || notAnchored) && <button type="button" onClick={verify} className="rounded-full border border-[#0985E7] px-5 py-3 text-sm font-black text-[#0985E7]">Retry verification</button>}</div>}
    </section>
  </div>;
}
