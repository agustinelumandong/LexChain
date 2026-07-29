'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { verifyRepositoryDocument } from '../../../lib/integrity-api';
import VerifyWorkspace from './verify-workspace';

export default function DocumentVerifyPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<Awaited<ReturnType<typeof verifyRepositoryDocument>>>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function verify() {
    setPending(true);
    setError(undefined);
    try {
      setResult(await verifyRepositoryDocument(id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Verification could not be completed.');
    } finally {
      setPending(false);
    }
  }

  return <div className="space-y-6">
    <Link href={`/portal/documents/${id}`} className="text-sm font-bold text-[#0985E7]">← Back to document</Link>
    <div><h1 className="text-2xl font-extrabold text-[#1B2559]">Document Verification</h1><p className="text-sm text-muted-foreground">Verify the stored document against its anchored hash.</p></div>
    <section className="rounded-[18px] border bg-white p-6 shadow">
      {!result && !error && <button type="button" onClick={verify} disabled={pending} className="rounded-full bg-[#0985E7] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{pending ? 'Verifying integrity…' : 'Verify integrity'}</button>}
      {error && <div role="alert" className="space-y-3"><p className="font-bold">Integrity status unavailable</p><p className="text-sm text-muted-foreground">{error}</p><button type="button" onClick={verify} className="rounded-full border border-[#0985E7] px-5 py-3 text-sm font-black text-[#0985E7]">Retry verification</button></div>}
      {result && <VerifyWorkspace result={result} onRetry={verify} />}
    </section>
  </div>;
}
