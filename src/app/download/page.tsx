import Image from "next/image";
import Link from "next/link";

export default function DownloadPage() {
  return (
    <main className="min-h-dvh bg-[#F5FAFF] px-5 py-12 text-[#0C2B49]">
      <section className="mx-auto max-w-5xl">
        <Link className="inline-flex items-center gap-2 text-sm font-black text-[#0067B3]" href="/">
          ← Back to LexChain
        </Link>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0067B3]">
              Install LexChain
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
              Use LexChain from your phone.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#5B6F8A]">
              LexChain is a mobile-friendly web app. Install it from your browser to open the
              same portal from your home screen. Document work still requires an internet
              connection.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#E4EEF9] bg-white p-6 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
            <Image
              alt="LexChain web app on a phone"
              className="mx-auto h-auto w-full max-w-[320px]"
              height={1080}
              src="/lexchain/hero-lexchain.png"
              width={864}
            />
          </div>
        </div>

        <section className="mt-10" aria-labelledby="install-heading">
          <h2 id="install-heading" className="text-2xl font-black text-[#0C2B49]">Add LexChain to your home screen</h2>
          <p className="mt-2 text-sm font-semibold text-[#5B6F8A]">Open the published LexChain site over HTTPS on your phone.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article id="android" className="scroll-mt-6 rounded-[18px] border border-[#E4EEF9] bg-white p-6 shadow-[0_10px_24px_rgba(12,43,73,0.06)]">
              <h3 className="text-lg font-black text-[#0C2B49]">Android with Chrome</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm font-semibold leading-6 text-[#5B6F8A]">
                <li>Open LexChain in Chrome.</li>
                <li>Open the browser menu and choose <strong>Install app</strong> or <strong>Install</strong>.</li>
                <li>Follow the prompt to add LexChain to your device.</li>
              </ol>
            </article>
            <article id="ios" className="scroll-mt-6 rounded-[18px] border border-[#E4EEF9] bg-white p-6 shadow-[0_10px_24px_rgba(12,43,73,0.06)]">
              <h3 className="text-lg font-black text-[#0C2B49]">iPhone or iPad with Safari</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm font-semibold leading-6 text-[#5B6F8A]">
                <li>Open LexChain in Safari and tap <strong>Share</strong>.</li>
                <li>Choose <strong>Add to Home Screen</strong>.</li>
                <li>Turn on <strong>Open as Web App</strong> if it is shown, then tap <strong>Add</strong>.</li>
              </ol>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
