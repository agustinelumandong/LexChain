import { AdminShell } from "./admin-shell";

type Card = {
  label: string;
  value: string | number;
  detail: string;
};

type Column<Row> = {
  key: string;
  label: string;
  render: (row: Row) => React.ReactNode;
};

type AdminResourcePageProps<Row> = {
  activeHref: string;
  title: string;
  subtitle: string;
  cards: Card[];
  columns: Column<Row>[];
  rows: Row[];
  notice?: string;
};

export function formatAdminDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function AdminBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#EEF4FB] px-2.5 py-1 text-xs font-black text-[#0985E7]">
      {children}
    </span>
  );
}

export function AdminResourcePage<Row>({
  activeHref,
  title,
  subtitle,
  cards,
  columns,
  rows,
  notice,
}: AdminResourcePageProps<Row>) {
  return (
    <AdminShell activeHref={activeHref}>
      <div className="mx-auto space-y-6">
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

        {notice ? (
          <div className="rounded-2xl border border-[#BEE3FF] bg-[#EAF6FF] px-5 py-4 text-sm font-semibold leading-6 text-[#0C2B49]">
            {notice}
          </div>
        ) : null}

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
                {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
                {card.detail}
              </p>
            </article>
          ))}
        </section>

        <article className="overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white">
          <div className="border-b border-[#E4EEF9] px-6 py-4">
            <h2 className="text-lg font-black text-[#0C2B49]">{title} Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[#E4EEF9] bg-[#F8FBFF]">
                  {columns.map((column) => (
                    <th
                      className="px-6 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-[#64748b]"
                      key={column.key}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#F8FBFF]"}
                    key={rowIndex}
                  >
                    {columns.map((column) => (
                      <td
                        className="px-6 py-3.5 align-top font-semibold text-[#0C2B49]"
                        key={column.key}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </AdminShell>
  );
}
