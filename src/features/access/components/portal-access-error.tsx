import Link from 'next/link';

type PortalAccessErrorProps = {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
};

export function PortalAccessError({ error, isRetrying, onRetry }: PortalAccessErrorProps) {
  return (
    <section role="alert" className="rounded-[18px] border border-[#E8F0F8] bg-white p-6">
      <h1 className="text-xl font-black text-[#0C2B49]">Could not verify portal access</h1>
      <p className="mt-2 text-sm text-[#5B6F8A]">{error instanceof Error ? error.message : 'Try loading your access again.'}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={isRetrying} onClick={onRetry} className="inline-flex min-h-11 items-center rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-60">{isRetrying ? 'Checking access…' : 'Retry access check'}</button>
        <Link href="/portal/documents" className="inline-flex min-h-11 items-center rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Back to Documents</Link>
      </div>
    </section>
  );
}
