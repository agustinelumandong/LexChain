import { PublicVerifyForm } from "./public-verify-form";

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] px-6 py-14 text-[#102033]">
      <section className="mx-auto max-w-3xl rounded-lg border border-[#d9e2ef] bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
          Public verifier
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Verify a notarized PDF
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#526172]">
          Upload one PDF and LexChain will check whether it matches a notarized
          record through the public verification API.
        </p>
        <div className="mt-8">
          <PublicVerifyForm />
        </div>
      </section>
    </main>
  );
}
