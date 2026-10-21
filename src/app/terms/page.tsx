import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | LexChain",
  description: "Terms for using the LexChain document service.",
};

const terms = [
  {
    title: "Using LexChain",
    copy: "LexChain provides tools to organize, search, process, share, and check the integrity of legal documents. Keep your account information accurate and protect your sign-in credentials.",
  },
  {
    title: "Documents and access",
    copy: "Upload or select only documents you are authorized to use. You are responsible for the documents and information you provide, and for choosing the people who receive access. LexChain may share a working draft with document parties accepted in the service, using access levels that reflect their role and the document stage.",
  },
  {
    title: "Processing and results",
    copy: "LexChain may extract text, create summaries, and identify document details to support its features. These results can be incomplete or inaccurate; review them against the original document before relying on them.",
  },
  {
    title: "Google Drive",
    copy: "If you connect Google, LexChain can create or copy working drafts in your Drive, work with files you select in Google Picker, sync draft comments, and share drafts with accepted document parties. Google services are also subject to Google's terms and privacy policies. Disconnecting Google revokes LexChain access but does not delete drafts already in your Drive.",
  },
  {
    title: "Integrity checks",
    copy: "A hash or blockchain record can help check whether a file matches a recorded version. It does not establish a document's legal validity, ownership, or enforceability. Blockchain entries cannot be changed or removed through LexChain.",
  },
  {
    title: "Legal advice and support",
    copy: "LexChain is a document management service, not a law firm, and does not provide legal advice. You remain responsible for reviewing documents and making legal decisions. For help with the service, contact support@lexchain.app.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#F5FAFF] px-5 py-12 text-[#0C2B49]">
      <section className="mx-auto max-w-3xl rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)] sm:p-9">
        <Link className="text-sm font-black text-[#0985E7]" href="/">
          ← Back to LexChain
        </Link>
        <p className="mt-10 text-xs font-black uppercase tracking-[0.18em] text-[#0985E7]">
          Terms
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight">Terms of Service</h1>
        <p className="mt-3 text-sm font-semibold text-[#64748b]">
          Last updated October 21, 2026
        </p>
        <p className="mt-4 text-base font-semibold leading-7 text-[#64748b]">
          These terms describe the basic rules for using LexChain. By using the service, you agree to follow them.
        </p>

        <ol className="mt-8 space-y-4">
          {terms.map((term, index) => (
            <li className="rounded-[18px] bg-[#F5FAFF] p-5" key={term.title}>
              <p className="text-xs font-black text-[#0985E7]">0{index + 1}</p>
              <h2 className="mt-2 text-lg font-black">{term.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
                {term.copy}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-sm font-semibold text-[#64748b]">
          See the <Link className="font-black text-[#0985E7]" href="/privacy">Privacy Policy</Link> for how LexChain handles your information.
        </p>
      </section>
    </main>
  );
}
