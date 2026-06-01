'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import ShieldIcon from '@mui/icons-material/Shield';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

const mockDocuments = [
  { id: 'doc-1', title: 'Contract Agreement.pdf', date: 'May 28, 2026', onChain: true },
  { id: 'doc-2', title: 'NDA Draft v2.pdf', date: 'May 27, 2026', onChain: false },
  { id: 'doc-3', title: 'Partnership Agreement.pdf', date: 'May 25, 2026', onChain: true },
  { id: 'doc-4', title: 'Employment Contract.pdf', date: 'May 24, 2026', onChain: false },
  { id: 'doc-5', title: 'Lease Agreement Final.pdf', date: 'May 22, 2026', onChain: true },
  { id: 'doc-6', title: 'Power of Attorney.pdf', date: 'May 20, 2026', onChain: false },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 w-full max-w-full box-border">
      {/* Header — matches mobile DocumentsHeader */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-[var(--portal-primary)] uppercase tracking-[0.5px]">
          AUTHORIZED SEARCH
        </span>
        <h1 className="text-2xl font-extrabold leading-[30px] text-[var(--portal-navy)]">
          Documents
        </h1>
        <p className="text-[13px] font-medium leading-[19px] text-[var(--portal-text-muted)]">
          Find by title, date, or keyword.
        </p>
      </div>

      {/* Search — matches mobile search bar */}
      <div className="min-h-[50px] rounded-full border border-[var(--portal-border-soft)] bg-white flex items-center gap-3 px-4 shadow-[0_4px_12px_rgba(19,59,115,0.05)] min-w-0">
        <SearchIcon sx={{ fontSize: 18, color: 'var(--portal-text-muted)' }} />
        <input
          type="text"
          placeholder="Title, party, date, or keyword"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-0 w-0 bg-transparent outline-none text-[13px] font-medium text-[var(--portal-navy)] placeholder:text-[var(--portal-text-muted)]"
        />
      </div>

      {/* Filter & Sort pills */}
      <div className="flex items-center gap-2">
        <button className="rounded-full border border-[var(--portal-border-soft)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--portal-navy)] flex items-center gap-1.5 shadow-[0_2px_8px_rgba(19,59,115,0.04)]">
          <FilterListIcon sx={{ fontSize: 14 }} />
          Filter
        </button>
        <button className="rounded-full border border-[var(--portal-border-soft)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--portal-navy)] flex items-center gap-1.5 shadow-[0_2px_8px_rgba(19,59,115,0.04)]">
          <SortIcon sx={{ fontSize: 14 }} />
          Sort
        </button>
      </div>

      {/* Document Cards — matches mobile DocumentResultCard */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <p className="text-sm font-extrabold text-[var(--portal-navy)]">No documents found</p>
          <p className="text-xs font-medium text-[var(--portal-text-muted)]">Try another title, party name, or date.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-4 flex flex-col gap-2.5 shadow-[0_4px_16px_rgba(19,59,115,0.06)] hover:opacity-95 transition-opacity overflow-hidden"
            >
              {/* Header row: title + shield icon */}
              <div className="flex items-start justify-between gap-3 min-w-0">
                <p className="flex-1 min-w-0 text-[15px] font-extrabold leading-5 text-[var(--portal-navy)] truncate">
                  {doc.title}
                </p>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${doc.onChain ? 'bg-[var(--portal-surface-soft)]' : 'bg-[#FDECEF]'}`}>
                  <ShieldIcon sx={{ fontSize: 18, color: doc.onChain ? 'var(--portal-primary)' : 'var(--portal-danger)' }} />
                </div>
              </div>

              {/* Meta row: date + Open button */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[var(--portal-text-muted)]">
                  Date: {doc.date}
                </span>
                <Link
                  href={`/portal/documents/${doc.id}`}
                  className="rounded-full bg-[var(--portal-primary)] px-3.5 py-2.5 text-xs font-extrabold text-white"
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
