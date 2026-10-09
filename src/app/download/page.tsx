import Image from "next/image";
import Link from "next/link";

const appOptions = [
  {
    title: "Android",
    availability: "Google Play link unavailable",
    copy: "A Google Play download link is not available on this page yet.",
  },
  {
    title: "iOS",
    availability: "App Store link unavailable",
    copy: "An App Store download link is not available on this page yet.",
  },
];

export default function DownloadPage() {
  return (
    <main className="min-h-dvh bg-[#F5FAFF] px-5 py-12 text-[#0C2B49]">
      <section className="mx-auto max-w-5xl">
        <Link className="inline-flex items-center gap-2 text-sm font-black text-[#0985E7]" href="/">
          ← Back to LexChain
        </Link>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0985E7]">
              Download app
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
              Use LexChain mobile for secure document work.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#64748b]">
              The website handles public pages, the Lawyer portal, and verification. The mobile
              app remains the main place for uploads, camera scans, PDF handling,
              deep links, and user document workflows.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#E4EEF9] bg-white p-6 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
            <Image
              alt="LexChain mobile app"
              className="mx-auto h-auto w-full max-w-[320px]"
              height={1080}
              src="/lexchain/hero-lexchain.png"
              width={864}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {appOptions.map((option) => (
            <article
              className="rounded-[18px] border border-[#E4EEF9] bg-white p-6 shadow-[0_10px_24px_rgba(12,43,73,0.06)]"
              key={option.title}
            >
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                {option.title}
              </p>
              <p className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 text-sm font-bold text-[#64748b]">
                {option.availability}
              </p>
              <p className="mt-4 text-sm font-semibold leading-6 text-[#64748b]">
                {option.copy}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
