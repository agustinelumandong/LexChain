import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#102033] px-6 py-14 text-white">
      <section className="mx-auto max-w-md rounded-lg bg-white p-8 text-[#102033]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
          LexChain admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Admin portal placeholder
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#526172]">
          Real admin session handling will be added after the backend auth
          contract is ready. Authorization stays enforced by the backend.
        </p>
        <Link
          className="mt-8 block rounded-md bg-[#102033] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#1d3554]"
          href="/admin/dashboard"
        >
          Enter dashboard
        </Link>
      </section>
    </main>
  );
}
