import Image from "next/image";
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
    <main className="flex min-h-dvh items-center justify-center bg-[#F5FAFF] px-5 py-14 text-[#102033]">
      <section className="w-full max-w-[760px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)] sm:p-8">
        <div className="flex items-center gap-3">
          <Image
            alt="LexChain logo"
            className="h-11 w-11"
            height={44}
            src="/lexchain/logo-lexchain.svg"
            width={44}
          />
          <div>
            <p className="text-sm font-black uppercase text-[#0985E7]">LexChain</p>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94A3B8]">
              Invitation fallback
            </p>
          </div>
        </div>

        <h1 className="mt-7 text-3xl font-black leading-9 text-[#0C2B49]">
          Continue your LexChain invite
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#64748b]">
          Use this page when an email invitation opens in a browser. You can open
          the mobile app, download it, or continue to the web portal when allowed.
        </p>

        <div className="mt-6 rounded-2xl bg-[#F5FAFF] p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">
            Invite token
          </p>
          <p className="mt-2 break-all font-mono text-sm font-black text-[#0C2B49]">
            {token}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <a
            className="rounded-full bg-[#0985E7] px-5 py-3 text-center text-sm font-black text-white shadow-[0_10px_24px_rgba(9,133,231,0.22)] transition hover:bg-[#0770c4]"
            href={appLink}
          >
            Open in app
          </a>
          <Link
            className="rounded-full border border-[#E4EEF9] bg-white px-5 py-3 text-center text-sm font-black text-[#0C2B49] transition hover:bg-[#F5FAFF]"
            href="/"
          >
            Download app
          </Link>
          <Link
            className="rounded-full border border-[#E4EEF9] bg-white px-5 py-3 text-center text-sm font-black text-[#0C2B49] transition hover:bg-[#F5FAFF]"
            href="/admin/login"
          >
            Continue on website
          </Link>
        </div>
      </section>
    </main>
  );
}
