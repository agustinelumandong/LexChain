import Link from "next/link";

type VerifyCodePageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function VerifyCodePage({ params }: VerifyCodePageProps) {
  const { code } = await params;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F5FAFF] px-5 py-14 text-[#102033]">
      <section className="w-full max-w-[760px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)] sm:p-8">
        <p className="text-sm font-black uppercase text-[#0985E7]">LexChain</p>
        <h1 className="mt-2 text-3xl font-black leading-9 text-[#0C2B49]">
          Verification code
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#64748b]">
          This route is reserved for code-based verification. The backend lookup
          endpoint is not connected yet, so live verification currently uses PDF upload.
        </p>

        <div className="mt-6 rounded-2xl bg-[#F5FAFF] p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">
            Submitted code
          </p>
          <p className="mt-2 break-all font-mono text-lg font-black text-[#0C2B49]">
            {code}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E4EEF9] bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#0C2B49]">
                Code lookup not connected yet
              </p>
              <p className="mt-1 text-sm font-semibold text-[#64748b]">
                Use PDF upload for the live `POST /public/verify` flow.
              </p>
            </div>
            <span className="rounded-full bg-[#FFF7ED] px-4 py-2 text-sm font-black text-[#C2410C]">
              Backend pending
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="rounded-full bg-[#0985E7] px-6 py-3 text-center text-sm font-black text-white shadow-[0_10px_24px_rgba(9,133,231,0.22)] transition hover:bg-[#0770c4]"
            href="/verify"
          >
            Upload PDF instead
          </Link>
          <Link
            className="rounded-full border border-[#E4EEF9] bg-white px-6 py-3 text-center text-sm font-black text-[#0C2B49] transition hover:bg-[#F5FAFF]"
            href="/"
          >
            Back to LexChain
          </Link>
        </div>
      </section>
    </main>
  );
}
