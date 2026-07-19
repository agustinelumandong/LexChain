import Link from 'next/link';
import { getProcessingMonitorItems, getProcessingStageLabel, type ProcessingStage } from '../lib/processing-monitor';

const stageClasses: Record<ProcessingStage, string> = {
  queued: 'bg-[#FFF4DD] text-[#B77900]',
  processing: 'bg-[#E8F4FF] text-[#0875C9]',
  completed: 'bg-[#EAF8F0] text-[#16834B]',
  failed: 'bg-[#FFF0F0] text-[#C53030]',
};

export default function ProcessingMonitorPage() {
  const items = getProcessingMonitorItems();

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Processing Monitor</h1>
        <p className="mt-1 text-sm text-[#64748b]">Track the local processing states for documents in the Document Issuer workspace.</p>
      </header>

      <p className="rounded-[18px] border border-[#E8F0F8] bg-[#F8FBFF] p-4 text-sm font-semibold text-[#64748b]">Demo data — changes reset when this page is refreshed.</p>

      <section aria-label="Document processing stages" className="overflow-hidden rounded-[18px] border border-[#E8F0F8] bg-white">
        <div className="divide-y divide-[#E8F0F8]">
          {items.map((item) => (
            <article key={item.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={item.documentHref} className="text-base font-black text-[#0C2B49] underline decoration-[#B9DDF9] underline-offset-4 hover:text-[#0985E7]">
                    {item.documentName}
                  </Link>
                  <p className="mt-2 text-sm text-[#64748b]">{item.detail}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${stageClasses[item.stage]}`}>
                  {getProcessingStageLabel(item.stage)}
                </span>
              </div>
              {item.failureReason ? (
                <p className="mt-4 rounded-xl border border-[#F5C6C6] bg-[#FFF7F7] p-3 text-sm font-semibold text-[#9B2C2C]">
                  Failure reason: {item.failureReason}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
