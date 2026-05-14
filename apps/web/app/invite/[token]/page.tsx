import Link from "next/link";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const appLink = `lexchain://sign-up?token=${encodeURIComponent(token)}`;

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-6 py-14 text-[#102033]">
      <section className="mx-auto max-w-3xl rounded-lg border border-[#d9e2ef] bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
          Invitation
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Continue your LexChain invite
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#526172]">
          Use this fallback page when an email invitation opens in a browser.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            className="rounded-md bg-[#102033] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#1d3554]"
            href={appLink}
          >
            Open in app
          </a>
          <Link
            className="rounded-md border border-[#b9c7d8] px-5 py-3 text-center text-sm font-semibold text-[#102033] transition hover:bg-[#eef3f9]"
            href="/"
          >
            Continue on website
          </Link>
        </div>
      </section>
    </main>
  );
}
