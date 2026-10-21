import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | LexChain",
  description: "How LexChain handles account, document, and Google data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-white px-5 py-12 text-[#0C2B49]">
      <section className="mx-auto max-w-3xl">
        <Link className="text-sm font-black text-[#0985E7]" href="/">
          ← Back to LexChain
        </Link>
        <p className="mt-10 text-xs font-black uppercase tracking-[0.18em] text-[#0985E7]">
          Privacy
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm font-semibold text-[#64748b]">
          Last updated October 21, 2026
        </p>
        <p className="mt-4 text-base font-semibold leading-7 text-[#64748b]">
          This policy explains how LexChain handles account, document, and Google data when you use the service.
        </p>

        <div className="mt-8 space-y-4">
          <article className="rounded-[18px] bg-[#F5FAFF] p-6">
            <h2 className="text-lg font-black">Information we handle</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
              LexChain processes account details such as your name, email address, role, and profile settings. It also handles files you upload, filenames and document details, extracted text, summaries, workflow events, comments, participant access, and audit records created while you use document features.
            </p>
          </article>

          <article className="rounded-[18px] bg-[#F5FAFF] p-6">
            <h2 className="text-lg font-black">How LexChain uses information</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
              We use this information to operate accounts, store and organize documents, extract and summarize content, support search, manage document access, send workflow notifications, and provide integrity checks. Document contents stay off-chain; integrity checks use document hashes and the record details needed to verify them.
            </p>
          </article>

          <article className="rounded-[18px] bg-[#F5FAFF] p-6">
            <h2 className="text-lg font-black">Google data</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
              If a lawyer connects Google, LexChain requests OpenID, email, and Google Drive file access (drive.file). We use that access for the Drive Picker, to create or copy working Google Docs drafts, to sync draft comments into LexChain, and to share drafts with document parties accepted in LexChain. Drive access is limited to files LexChain creates or files the lawyer specifically selects; it does not provide access to the rest of the lawyer&apos;s Drive.
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#64748b]">
              LexChain stores the connected Google account email and encrypts the access and refresh tokens needed for the connection. The browser receives an access token for the Google Picker. Disconnecting Google revokes LexChain&apos;s access and removes the stored tokens; Google Docs already created remain in the lawyer&apos;s Drive. Google data is used to provide these Google Drive features, not for unrelated purposes.
            </p>
          </article>

          <article className="rounded-[18px] bg-[#F5FAFF] p-6">
            <h2 className="text-lg font-black">Sharing and service providers</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
              Document information is available to the LexChain users who have access to that document. LexChain may use providers for hosting, storage, authentication, document processing, and email delivery so the service can work. Google handles information used by its Drive services under Google&apos;s own policies and the settings of the connected account.
            </p>
          </article>

          <article className="rounded-[18px] bg-[#F5FAFF] p-6">
            <h2 className="text-lg font-black">Storage and retention</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
              LexChain stores document files and related records to provide document workflows and maintain their activity history. Retention depends on the account and document lifecycle. A document hash or limited integrity record may be written to a blockchain; blockchain entries may be publicly viewable and cannot be changed or removed through LexChain.
            </p>
          </article>

          <article className="rounded-[18px] bg-[#F5FAFF] p-6">
            <h2 className="text-lg font-black">Contact</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
              For questions about this policy or a data request, contact{" "}
              <a className="font-black text-[#0985E7]" href="mailto:support@lexchain.app">
                support@lexchain.app
              </a>
              . You can also review the <Link className="font-black text-[#0985E7]" href="/terms">Terms of Service</Link>.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
