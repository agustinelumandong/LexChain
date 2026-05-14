type VerifyCodePageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function VerifyCodePage({ params }: VerifyCodePageProps) {
  const { code } = await params;

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-6 py-14 text-[#102033]">
      <section className="mx-auto max-w-3xl rounded-lg border border-[#d9e2ef] bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
          Verification code
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{code}</h1>
        <p className="mt-4 text-sm leading-6 text-[#526172]">
          Code-based verification is reserved for the backend endpoint. This
          page keeps the public route stable without pretending the endpoint is
          complete.
        </p>
      </section>
    </main>
  );
}
