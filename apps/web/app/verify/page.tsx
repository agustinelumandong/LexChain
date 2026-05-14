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
          This route will replace the Expo web public verifier. The full upload
          flow will use browser file APIs and the shared API layer once extracted.
        </p>
        <label className="mt-8 block rounded-lg border border-dashed border-[#9fb0c6] bg-[#f7f9fc] p-8 text-center text-sm font-medium text-[#526172]">
          PDF upload placeholder
          <input className="sr-only" type="file" accept="application/pdf,.pdf" />
        </label>
      </section>
    </main>
  );
}
