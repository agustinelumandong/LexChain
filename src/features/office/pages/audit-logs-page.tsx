import { requireDocumentIssuerPage } from "@/features/access/server";

export default async function PortalAuditLogsPage() {
  await requireDocumentIssuerPage();

  return <div className="flex max-w-3xl flex-col gap-5">
    <div><p className="text-xs font-black tracking-wider text-[#0985E7]">AUDIT &amp; COMPLIANCE</p><h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">Audit Logs</h1></div>
    <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
      <h2 className="text-base font-black text-[#0C2B49]">Audit history unavailable</h2>
      <p role="status" className="mt-2 text-sm font-semibold text-[#64748b]">Audit history is not available in this portal yet.</p>
    </section>
  </div>;
}
