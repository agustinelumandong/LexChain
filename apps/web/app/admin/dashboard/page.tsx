import { AdminShell } from "../admin-shell";

const stats = [
  { label: "Total users", value: "1,248", detail: "Registered accounts", icon: "◉" },
  { label: "Document issuers", value: "86", detail: "Offices and law firms", icon: "▣" },
  { label: "Uploaded documents", value: "3,421", detail: "Metadata monitored", icon: "▤" },
  { label: "Processed documents", value: "2,987", detail: "OCR/NLP completed", icon: "✓" },
  { label: "Pending documents", value: "128", detail: "Queued or processing", icon: "⌛" },
  { label: "Failed documents", value: "17", detail: "Needs retry or review", icon: "!" },
  { label: "Verifications", value: "5,604", detail: "Verification attempts", icon: "◈" },
  { label: "Tamper alerts", value: "9", detail: "Hash mismatch results", icon: "△" },
];

const days = [
  { day: "Mon", processed: 42, pending: 18 },
  { day: "Tue", processed: 56, pending: 20 },
  { day: "Wed", processed: 64, pending: 26 },
  { day: "Thu", processed: 82, pending: 29 },
  { day: "Fri", processed: 80, pending: 27 },
  { day: "Sat", processed: 68, pending: 21 },
  { day: "Sun", processed: 46, pending: 15 },
];

const pipeline = [
  "Upload received",
  "OCR extraction",
  "NLP summary",
  "Blockchain anchoring",
  "Verification logging",
];

export default function AdminDashboardPage() {
  return (
    <AdminShell activeHref="/admin/dashboard">
      <div className="mx-auto max-w-[1180px] space-y-6">
        <header className="space-y-1.5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0985E7]">
            LexChain Super Admin
          </p>
          <h1 className="text-[32px] font-black leading-[38px] text-[#0C2B49]">
            Dashboard
          </h1>
          <p className="max-w-3xl text-sm font-semibold leading-5 text-[#64748b]">
            System-owner view for platform health, document processing,
            blockchain anchoring, and verification activity.
          </p>
        </header>

        <div className="flex flex-col gap-3 rounded-[18px] bg-transparent sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-12 flex-1 items-center justify-between rounded-2xl border border-[#E4EEF9] bg-white px-4 text-sm font-semibold text-[#94A3B8]">
            <span>Search system activity...</span>
            <span>⌕</span>
          </div>
          <div className="flex gap-3">
            <button className="h-12 w-12 rounded-2xl border border-[#E4EEF9] bg-white text-[#0C2B49]">
              ◌
            </button>
            <button className="h-12 w-12 rounded-2xl bg-[#0985E7] text-white">
              ◈
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => (
            <article
              className="flex gap-4 rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-[0_1px_3px_rgba(12,43,73,0.03)]"
              key={card.label}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#0985E7]/10 text-xl font-black text-[#0985E7]">
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">
                  {card.label}
                </p>
                <p className="mt-1 text-3xl font-black text-[#0C2B49]">{card.value}</p>
                <p className="mt-1 text-xs font-bold text-[#64748b]">{card.detail}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
          <article className="rounded-2xl border border-[#E4EEF9] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-[#0C2B49]">
                  Document Processing Trend
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#64748b]">
                  Demo month-by-month platform activity for LexChain documents.
                </p>
              </div>
              <div className="flex gap-4 text-xs font-black text-[#64748b]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0777F2]" />
                  Processed
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#B7C1CE]" />
                  Pending
                </span>
              </div>
            </div>
            <div className="mt-7 h-[260px] rounded-2xl bg-[#F8FBFF] p-5">
              <svg className="h-full w-full" viewBox="0 0 760 260" role="img" aria-label="Document processing trend chart">
                {[0, 1, 2, 3].map((line) => {
                  const y = 36 + line * 46;
                  return (
                    <line
                      key={line}
                      x1="34"
                      x2="730"
                      y1={y}
                      y2={y}
                      stroke="#DCE9F8"
                      strokeDasharray="6 8"
                    />
                  );
                })}
                <path d="M36 143 C80 140 84 74 126 92 C166 111 138 206 188 205 C231 204 214 122 264 116 C315 110 352 153 392 137 C443 117 431 202 492 192 C546 182 540 69 590 72 C647 76 600 216 670 203 C698 198 699 144 728 142" fill="none" stroke="#0777F2" strokeLinecap="round" strokeWidth="4" />
                <path d="M36 166 C82 166 85 217 126 210 C166 203 145 158 188 167 C240 178 218 178 264 174 C318 170 324 137 386 126 C430 118 433 90 492 100 C540 110 524 204 582 154 C628 112 610 150 670 142 C697 138 696 111 728 108" fill="none" stroke="#B7C1CE" strokeLinecap="round" strokeWidth="3" />
                <line x1="392" x2="392" y1="36" y2="224" stroke="#99CDFB" strokeDasharray="4 6" />
                <circle cx="392" cy="137" fill="#0777F2" r="8" stroke="#FFFFFF" strokeWidth="4" />
                <rect fill="#0777F2" height="54" rx="12" width="118" x="332" y="84" />
                <text fill="#FFFFFF" fontSize="16" fontWeight="700" textAnchor="middle" x="391" y="106">Processed</text>
                <text fill="#FFFFFF" fontSize="18" fontWeight="800" textAnchor="middle" x="391" y="126">2,100</text>
              </svg>
            </div>
          </article>

          <article className="rounded-2xl bg-[#0985E7] p-6 text-white shadow-[0_18px_48px_rgba(9,133,231,0.24)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">
                Super Admin scope
              </p>
              <span className="text-2xl">◈</span>
            </div>
            <p className="mt-8 text-sm font-semibold leading-6 text-white/85">
              Monitor system activity, users, document metadata, processing
              status, blockchain records, and audit events. Private legal content
              remains controlled by document-level access and whitelist permissions.
            </p>
            <div className="mt-10">
              <p className="text-5xl font-black">9</p>
              <p className="text-sm font-black text-white/70">tamper alerts monitored</p>
            </div>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <article className="rounded-2xl border border-[#E4EEF9] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#0C2B49]">Activity</h2>
              <p className="text-xs font-black text-[#64748b]">Processed / Pending</p>
            </div>
            <div className="mt-6 flex h-56 items-end justify-between gap-3">
              {days.map((item) => (
                <div className="flex flex-1 flex-col items-center gap-2" key={item.day}>
                  <div className="relative flex h-44 w-full max-w-8 items-end overflow-hidden rounded-full bg-[#EEF4FB]">
                    <div className="absolute bottom-0 w-full bg-[#BDE0FE]" style={{ height: `${item.pending}%` }} />
                    <div className="absolute bottom-0 w-full bg-[#0985E7]" style={{ height: `${item.processed}%` }} />
                  </div>
                  <p className="text-xs font-black text-[#64748b]">{item.day}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#E4EEF9] bg-white p-6">
            <h2 className="text-lg font-black text-[#0C2B49]">Operational Snapshot</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
              Demo analytics for processed documents, category usage, verification
              results, and OCR/NLP health.
            </p>
            <div className="mt-6 space-y-5">
              {["Processed documents", "Verified records", "OCR accuracy"].map((item, index) => (
                <div key={item}>
                  <div className="flex justify-between text-sm font-black">
                    <span>{item}</span>
                    <span>{index === 2 ? "91%" : "74%"}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#EEF4FB]">
                    <div className="h-2 rounded-full bg-[#0985E7]" style={{ width: index === 2 ? "91%" : "74%" }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#E4EEF9] bg-white p-6">
            <h2 className="text-lg font-black text-[#0C2B49]">Processing Pipeline</h2>
            <div className="mt-6 space-y-4">
              {pipeline.map((item, index) => (
                <div className="flex gap-3" key={item}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0985E7]/10 text-sm font-black text-[#0985E7]">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#0C2B49]">{item}</p>
                    <p className="text-xs font-bold text-[#64748b]">Operational</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </AdminShell>
  );
}
