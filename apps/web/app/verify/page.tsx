import { PublicVerifyForm } from "./public-verify-form";

export default function VerifyPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F5FAFF] px-5 py-14 text-[#102033]">
      <section className="w-full max-w-[760px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)] sm:p-8">
        <p className="text-sm font-black uppercase text-[#0985E7]">
          LexChain
        </p>
        <h1 className="mt-2 text-3xl font-black leading-9 text-[#0C2B49]">
          Public verifier
        </h1>
        <p className="mt-3 text-sm font-semibold leading-5 text-[#64748b]">
          Upload a PDF to check whether its file hash matches a LexChain integrity record.
        </p>
        <p className="mt-2 text-sm font-semibold leading-5 text-[#64748b]">
          This checks file integrity only. It does not determine legal validity,
          notarization, or enforceability.
        </p>
        <div className="mt-8">
          <PublicVerifyForm />
        </div>
      </section>
    </main>
  );
}
