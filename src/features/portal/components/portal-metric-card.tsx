export function MetricCard({ icon, label, value, detail, color }: { icon: React.ReactNode; label: string; value: number | string; detail: string; color: string }) {
  return (
    <article className="flex min-h-[112px] min-w-0 items-center gap-2 rounded-2xl border border-[#E4EEF9] bg-white p-3 shadow-sm shadow-[#DDEAF7]/40 transition hover:-translate-y-0.5 hover:border-[#C7DBEF] lg:gap-3 lg:p-4">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-full lg:size-11 ${color}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="break-words text-xs font-black text-[#0C2B49]">{label}</p>
        <p title={String(value)} className="mt-1 break-words text-xl font-black leading-tight text-[#071B33] lg:text-2xl">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="mt-2 break-words text-xs font-semibold text-[#5B6F8A]">{detail}</p>
      </div>
    </article>
  );
}
