import { AdminShell } from "./admin-shell";

type AdminPlaceholderPageProps = {
  activeHref: string;
  title: string;
  subtitle: string;
  cards: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
};

export function AdminPlaceholderPage({
  activeHref,
  title,
  subtitle,
  cards,
}: AdminPlaceholderPageProps) {
  return (
    <AdminShell activeHref={activeHref}>
      <div className="mx-auto max-w-[1180px] space-y-6">
        <header className="space-y-1.5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0985E7]">
            LexChain Super Admin
          </p>
          <h1 className="text-[32px] font-black leading-[38px] text-[#0C2B49]">
            {title}
          </h1>
          <p className="max-w-3xl text-sm font-semibold leading-5 text-[#64748b]">
            {subtitle}
          </p>
        </header>

        <div className="flex min-h-12 items-center justify-between rounded-2xl border border-[#E4EEF9] bg-white px-4 text-sm font-semibold text-[#94A3B8]">
          <span>Search {title.toLowerCase()}...</span>
          <span>⌕</span>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article
              className="rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-[0_1px_3px_rgba(12,43,73,0.03)]"
              key={card.label}
            >
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-black text-[#0C2B49]">
                {card.value}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
                {card.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-[#E4EEF9] bg-white p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0C2B49]">Migration status</h2>
              <p className="mt-1 text-sm font-semibold text-[#64748b]">
                This Next.js route is ready. Full data wiring and table actions
                will be migrated after shared API packages are extracted.
              </p>
            </div>
            <span className="rounded-full bg-[#EAF6FF] px-4 py-2 text-sm font-black text-[#0770c4]">
              Web shell ready
            </span>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
