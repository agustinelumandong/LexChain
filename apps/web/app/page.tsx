import Image from "next/image";
import Link from "next/link";

const problems = [
  {
    title: "Scattered storage",
    copy: "Legal files sit across paper folders, email threads, shared drives, and manual logs.",
  },
  {
    title: "Slow retrieval",
    copy: "Teams lose time because records are named, tagged, or stored inconsistently.",
  },
  {
    title: "Weak integrity checks",
    copy: "Users cannot quickly prove that a scanned copy still matches the original file.",
  },
  {
    title: "Unclear access",
    copy: "Sensitive documents are often shared without controlled visibility.",
  },
];

const features = [
  "Secure upload and organized document storage",
  "OCR and NLP processing for scanned legal files",
  "AI summaries for long legal documents",
  "Key party, date, obligation, and clause detection",
  "Ask-document search across authorized records",
  "Blockchain-backed hash verification",
];

const steps = ["Upload", "Extract", "Summarize", "Protect", "Verify"];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0f172a]">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link className="flex items-center gap-3" href="/">
            <Image
              alt="LexChain logo"
              className="h-10 w-10"
              height={40}
              src="/lexchain/logo-lexchain.svg"
              width={40}
            />
            <span>
              <span className="block text-base font-black">LexChain</span>
              <span className="block text-xs font-semibold text-slate-500">
                Legal documents, secured
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
              href="/verify"
            >
              Verify Document
            </Link>
            <Link
              className="rounded-full bg-[#0985E7] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(9,133,231,0.22)] transition hover:bg-[#0770c4]"
              href="/login"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      <section className="overflow-hidden bg-[#EAF6FF]">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex rounded-full border border-[#0985E7]/20 bg-[#0985E7]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#0770c4]">
              Blockchain-powered document verification
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
              Find, understand, share, and verify legal documents with confidence.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
              LexChain helps document issuers, law offices, organizations, and
              authorized users manage secure, searchable, and tamper-evident legal
              documents.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="rounded-md bg-[#0985E7] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#0770c4]"
                href="/verify"
              >
                Verify a Document
              </Link>
              <Link
                className="rounded-md border border-slate-300 bg-white px-5 py-3 text-center text-sm font-black text-slate-900 transition hover:bg-slate-50"
                href="/login"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Download the app
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Image
                  alt="Download on the App Store"
                  className="h-10 w-auto"
                  height={40}
                  src="/lexchain/app-store-badge.png"
                  width={120}
                />
                <div className="flex h-10 items-center rounded-lg bg-slate-950 px-4 text-sm font-black text-white">
                  Google Play
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[460px]">
            <div className="absolute left-10 top-8 h-72 w-72 rounded-full bg-[#0985E7]/15 blur-3xl" />
            <Image
              alt="LexChain mobile document dashboard"
              className="relative z-10 mx-auto h-auto w-[min(84vw,420px)] drop-shadow-[0_28px_70px_rgba(12,43,73,0.25)]"
              height={1080}
              priority
              src="/lexchain/hero-lexchain.png"
              width={864}
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
              The problem
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Legal documents are hard to find, easy to lose, and difficult to verify.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              LexChain replaces scattered records with a controlled document system
              built for search, access, and trust.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {problems.map((item) => (
              <article className="rounded-lg bg-red-50 p-6" key={item.title}>
                <h3 className="text-lg font-black">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#F8FBFF] px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0985E7]">
              Main features
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Built for faster legal document work.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              The system focuses on daily value: retrieval, understanding,
              controlled sharing, and reliable integrity checks.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                key={feature}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#0985E7]/10 text-sm font-black text-[#0985E7]">
                  0{index + 1}
                </div>
                <h3 className="mt-5 text-base font-black">{feature}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0C2B49] px-5 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ecbff]">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              From upload to verification in one controlled flow.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/70">
              Users get a simple experience while the system handles extraction,
              search, access rules, and blockchain-backed integrity checks.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {steps.map((step, index) => (
              <div className="rounded-lg border border-white/10 bg-white/5 p-5" key={step}>
                <p className="text-sm font-black text-white/40">0{index + 1}</p>
                <h3 className="mt-8 text-lg font-black">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0985E7]">
              Document verification
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Know if a document still matches the original file.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              LexChain creates a unique file hash and checks it against a
              blockchain-backed record. If a file changes, the hash changes too.
            </p>
            <ul className="mt-6 space-y-3 text-sm font-bold text-slate-700">
              <li>Verify without exposing private document content on-chain.</li>
              <li>Confirm integrity before accepting or sharing a copy.</li>
              <li>Give issuers and users a reliable authenticity check.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_20px_70px_rgba(9,133,231,0.10)]">
            <Image
              alt="LexChain verification interface"
              className="h-auto w-full rounded-md"
              height={1080}
              src="/lexchain/hero-two-mobile-lexchain.png"
              width={1080}
            />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#F8FBFF] px-5 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-md bg-slate-50 p-4 text-sm font-bold text-slate-600">
              What are the payment obligations in this contract?
            </div>
            <div className="mt-4 rounded-md bg-[#0985E7] p-5 text-white">
              <p className="text-xs font-black uppercase text-white/70">
                LexChain Answer
              </p>
              <p className="mt-2 text-sm leading-6">
                The contract requires monthly payment every 15th day, proof of
                payment submission, and a late fee after the grace period.
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0985E7]">
              Search and ask-document
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Ask questions across documents you are allowed to access.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Users can search document content or ask focused questions.
              LexChain answers from authorized records only.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-5xl rounded-lg bg-[#0985E7] px-6 py-14 text-center text-white shadow-[0_24px_70px_rgba(9,133,231,0.22)] sm:px-12">
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
            Bring legal documents into one secure, searchable, verifiable system.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/80">
            Retrieve records faster, understand documents easier, control access,
            and verify integrity with confidence.
          </p>
          <Link
            className="mt-8 inline-flex rounded-md bg-white px-5 py-3 text-sm font-black text-[#0770c4] transition hover:bg-slate-100"
            href="/verify"
          >
            Try the verifier
          </Link>
        </div>
      </section>

      <footer className="bg-[#0C2B49] px-5 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              alt="LexChain logo"
              className="h-9 w-9"
              height={36}
              src="/lexchain/logo-lexchain.svg"
              width={36}
            />
            <p className="text-lg font-black">LexChain</p>
          </div>
          <div className="flex gap-5 text-sm font-bold text-[#8ecbff]">
            <Link href="/verify">Verify</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/download">Download</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
          <p className="text-xs font-medium text-white/50">
            © {new Date().getFullYear()} LexChain. Blockchain-powered document verification.
          </p>
        </div>
      </footer>
    </main>
  );
}
