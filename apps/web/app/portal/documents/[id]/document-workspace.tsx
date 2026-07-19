'use client';

import { useState } from 'react';
import type { PortalUiRole } from '../../lib/portal-role';

type WorkspaceDocument = {
  document_number?: number | string | null;
  content_type?: string | null;
  storage_url?: string | null;
  summary?: string | null;
  labels?: unknown[] | null;
  entities?: unknown[] | null;
  risk_flags?: unknown[] | null;
};

type BlockchainRecord = {
  data_hash?: string | null;
  tx_hash?: string | null;
  onchain_timestamp?: number | null;
} | null | undefined;

const tabs = ['Overview', 'Original PDF', 'Insights', 'Blockchain'] as const;
type Tab = typeof tabs[number];

function readable(value: unknown) {
  if (value == null) return 'Not supplied';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function InsightGroup({ title, items }: { title: string; items?: unknown[] | null }) {
  if (!items?.length) return null;

  return (
    <section>
      <h3 className="text-xs font-black uppercase tracking-[0.08em] text-[#64748b]">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => <li key={index} className="rounded-xl bg-[#F8FBFF] px-3 py-2 text-sm text-[#0C2B49]">{readable(item)}</li>)}
      </ul>
    </section>
  );
}

export function DocumentWorkspace({ document, chain }: { document: WorkspaceDocument; role: PortalUiRole; chain?: BlockchainRecord }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const hasInsights = Boolean(document.summary || document.labels?.length || document.entities?.length || document.risk_flags?.length);

  return (
    <section className="rounded-[18px] border border-[#E8F0F8] bg-white shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
      <div role="tablist" aria-label="Document workspace" className="flex overflow-x-auto border-b border-[#E8F0F8] px-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            type="button"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-extrabold ${activeTab === tab ? 'border-[#0985E7] text-[#0985E7]' : 'border-transparent text-[#64748b]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="p-5">
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#0C2B49]">Overview</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-bold text-[#64748b]">Reference</dt><dd className="mt-1 text-[#0C2B49]">{document.document_number ?? 'Not supplied'}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Content type</dt><dd className="mt-1 text-[#0C2B49]">{document.content_type ?? 'Not supplied'}</dd></div>
            </dl>
            <p className="text-sm leading-6 text-[#64748b]">Use this workspace to review the original file, derived assistance, and available integrity information.</p>
          </div>
        )}

        {activeTab === 'Original PDF' && (document.storage_url ? (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#0C2B49]">Original PDF</h2>
            <p className="text-sm leading-6 text-[#64748b]">This is the source document and is available for viewing or download only. It cannot be edited in LexChain.</p>
            <div className="flex flex-wrap gap-3">
              <a href={document.storage_url} target="_blank" rel="noreferrer" className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Open original PDF</a>
              <a href={document.storage_url} download className="rounded-full border border-[#E8F0F8] px-4 py-2.5 text-sm font-extrabold text-[#0C2B49]">Download original PDF</a>
            </div>
          </div>
        ) : <p className="text-sm text-[#64748b]">The original PDF is not available in the current document record.</p>)}

        {activeTab === 'Insights' && (
          <div className="space-y-5">
            <div><h2 className="text-lg font-extrabold text-[#0C2B49]">Insights</h2><p className="mt-1 text-sm leading-6 text-[#64748b]">AI-generated assistance only. Review it carefully; the original document remains authoritative.</p></div>
            {hasInsights ? <div className="space-y-5">
              {document.summary && <section><h3 className="text-xs font-black uppercase tracking-[0.08em] text-[#64748b]">Summary</h3><p className="mt-2 text-sm leading-6 text-[#0C2B49]">{document.summary}</p></section>}
              <InsightGroup title="Labels" items={document.labels} />
              <InsightGroup title="Entities" items={document.entities} />
              <InsightGroup title="Risk flags" items={document.risk_flags} />
            </div> : <p className="text-sm text-[#64748b]">No derived insights are available in the current document record.</p>}
          </div>
        )}

        {activeTab === 'Blockchain' && (chain?.data_hash ? (
          <div className="space-y-4"><div><h2 className="text-lg font-extrabold text-[#0C2B49]">Blockchain</h2><p className="mt-1 text-sm leading-6 text-[#64748b]">A hash record supports integrity checking, not legal validity.</p></div><dl className="space-y-3 text-sm"><div><dt className="font-bold text-[#64748b]">Data hash</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{chain.data_hash}</dd></div>{chain.tx_hash && <div><dt className="font-bold text-[#64748b]">Transaction hash</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{chain.tx_hash}</dd></div>}</dl></div>
        ) : <p className="text-sm text-[#64748b]">No blockchain record is available in the current document record.</p>)}
      </div>
    </section>
  );
}
