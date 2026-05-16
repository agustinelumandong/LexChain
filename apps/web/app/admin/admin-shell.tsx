import Link from "next/link";

const adminLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "▦" },
  { label: "Users", href: "/admin/users", icon: "◉" },
  { label: "Document Issuers", href: "/admin/document-issuers", icon: "▣" },
  { label: "Documents", href: "/admin/documents", icon: "▤" },
  { label: "Categories", href: "/admin/categories", icon: "◇" },
  { label: "Invitations & Permissions", href: "/admin/invitations-permissions", icon: "◆" },
  { label: "Verification Logs", href: "/admin/verification-logs", icon: "✓" },
  { label: "Blockchain Records", href: "/admin/blockchain-records", icon: "⛓" },
  { label: "OCR / NLP Processing", href: "/admin/ocr-nlp-processing", icon: "▧" },
  { label: "Analytics", href: "/admin/analytics", icon: "⌁" },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: "⌕" },
  { label: "System Settings", href: "/admin/system-settings", icon: "⚙" },
];

type AdminShellProps = {
  activeHref?: string;
  children: React.ReactNode;
};

export function AdminShell({ activeHref = "/admin/dashboard", children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#F5FAFF] text-[#111827]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[292px] shrink-0 flex-col gap-7 border-r border-[#E8F0F8] bg-white px-[22px] pb-[22px] pt-[26px] lg:flex">
          <Link className="flex min-h-[52px] items-center gap-3.5" href="/admin/dashboard">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#111827] text-xl font-black text-white">
              ◈
            </div>
            <div>
              <p className="text-[25px] font-black leading-8">LexChain</p>
              <p className="text-[11px] font-black uppercase leading-4 text-[#9AA8B8]">
                Super Admin
              </p>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
            {adminLinks.map((link) => {
              const isActive = link.href === activeHref;

              return (
                <Link
                  className={[
                    "flex min-h-11 items-center gap-3.5 rounded-xl py-2 pl-[22px] pr-3 text-[13px] font-black leading-4",
                    isActive
                      ? "bg-[#EEF4FB] text-[#111827]"
                      : "text-[#A0AAB8] transition hover:bg-[#F5FAFF] hover:text-[#111827]",
                  ].join(" ")}
                  href={link.href}
                  key={link.href}
                >
                  <span className={isActive ? "text-[#0985E7]" : "text-[#A7B4C4]"}>
                    {link.icon}
                  </span>
                  <span className="flex-1">{link.label}</span>
                  <span
                    className={[
                      "h-6 w-[5px] rounded-full",
                      isActive ? "bg-[#0985E7]" : "bg-transparent",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 rounded-2xl border border-[#E4EEF9] bg-[#F5FAFF] p-3.5">
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white text-[#0985E7]">
              ✓
            </div>
            <div>
              <p className="text-[13px] font-black">System owner</p>
              <p className="text-[11px] font-bold text-[#64748b]">Demo monitoring mode</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-7">
          {children}
        </section>
      </div>
    </main>
  );
}
