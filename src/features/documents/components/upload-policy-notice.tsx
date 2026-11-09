'use client';

import { useEffect, useRef, useState } from 'react';
import { PrivacyContent } from '@/shared/components/legal/privacy-content';
import { TermsContent } from '@/shared/components/legal/terms-content';

type Policy = 'privacy' | 'terms';

function PolicyDialog({ policy, onClose }: { policy: Policy; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const title = policy === 'privacy' ? 'Privacy Notice' : 'Terms of Use';

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.showModal();
    return () => { if (previousFocus?.isConnected) previousFocus.focus(); };
  }, []);

  return (
    <dialog ref={dialogRef} aria-label={title} onCancel={(event) => { event.preventDefault(); onClose(); }} onKeyDown={(event) => event.stopPropagation()} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/40">
      <div className="flex items-center justify-between border-b border-[#E4EEF9] px-5 py-3">
        <h2 className="text-lg font-bold text-[#0C2B49]">{title}</h2>
        <button type="button" onClick={onClose} className="min-h-11 rounded-full px-4 text-sm font-bold text-[#0067B3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Close</button>
      </div>
      <div tabIndex={0} className="max-h-[calc(90dvh-4.5rem)] overflow-y-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0067B3]">
        {policy === 'privacy' ? <PrivacyContent inDialog /> : <TermsContent inDialog />}
      </div>
    </dialog>
  );
}

export function UploadPolicyNotice() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  return (
    <>
      <p className="mt-2 text-sm leading-5 text-[#4B6382]">
        By uploading, you acknowledge the <a href="/privacy" onClick={(event) => { event.preventDefault(); setPolicy('privacy'); }} className="font-bold text-[#0067B3] underline">Privacy Notice</a> and <a href="/terms" onClick={(event) => { event.preventDefault(); setPolicy('terms'); }} className="font-bold text-[#0067B3] underline">Terms of Use</a>.
      </p>
      {policy && <PolicyDialog policy={policy} onClose={() => setPolicy(null)} />}
    </>
  );
}
