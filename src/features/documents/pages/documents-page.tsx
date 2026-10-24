'use client';

import { useState } from 'react';
import { FilterDetails } from '@/shared/components/ui/filter-details';
import Link from 'next/link';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import SearchIcon from '@mui/icons-material/Search';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FilterListIcon from '@mui/icons-material/FilterList';
import DescriptionIcon from '@mui/icons-material/Description';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Dropdown } from "@/features/admin/components";
import { getDocumentLifecycleBadgeClasses, getDocumentLifecycleLabel, getDocumentProcessingBadgeClasses, getDocumentProcessingStatusLabel } from '@/features/documents/document-ui';
import { getPortalUiRole } from "@/features/access";
import { CreateDocumentRecordForm } from '@/features/documents/components/create-document-record-form';
import {
  getDocumentLifecycles,
  getDocumentsByOwnership,
  getVisibleDocuments,
  type DocumentListItem,
  type DocumentListFilters,
} from '@/features/documents/document-library';
import type { ApiSchema } from '@/shared/types/index';
import { portalRequest } from '@/shared/api/client';
import { PortalApiError } from '@/shared/api/portal-error';

type Document = DocumentListItem;

function getDatePickerSlotProps(label: string) {
  return {
    textField: {
      size: 'small' as const,
      fullWidth: true,
      sx: { '& .MuiPickersOutlinedInput-root': { borderRadius: 3, backgroundColor: '#F8FBFF', color: '#0C2B49' } },
      slotProps: { htmlInput: { 'aria-label': `${label} date` } },
    },
    field: { clearable: true, 'aria-label': `${label} date` },
    popper: { disablePortal: true },
    desktopPaper: { sx: { borderRadius: 3, border: '1px solid #E4EEF9' } },
  };
}

function getDatePickerLocaleText(label: string) {
  return {
    openDatePickerDialogue: (formattedDate: string | null) => formattedDate
      ? `Choose ${label.toLowerCase()} date, selected date is ${formattedDate}`
      : `Choose ${label.toLowerCase()} date`,
  };
}

type UserProfile = ApiSchema<'UserProfileResponse'>;

async function fetchDocuments(): Promise<Document[]> {
  const res = await portalRequest('/api/portal/proxy?path=%2Fdocuments%2F');
  return res.json();
}

function documentsErrorMessage(error: unknown) {
  const status = error instanceof Error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : undefined;
  return status === 401 || status === 403
    ? 'You do not have permission to view these documents.'
    : error instanceof PortalApiError ? error.message : 'Unable to load documents.';
}

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(iso?: string | null) {
  if (!iso) return 'Not available';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function DocumentBadges({ document }: { document: Document }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getDocumentLifecycleBadgeClasses(document.lifecycle)}`}>{getDocumentLifecycleLabel(document.lifecycle)}</span>
      {document.lifecycle === 'FINALIZED' && <span className={`${getDocumentProcessingBadgeClasses(document.status)} rounded-full px-2.5 py-0.5 text-xs font-bold`}>{getDocumentProcessingStatusLabel(document.lifecycle, document.status)}</span>}
    </div>
  );
}

function getAttentionStatus(document: Document) {
  const status = document.status?.trim().toUpperCase();
  const lifecycle = document.lifecycle.trim().toUpperCase();

  if (status === 'FAILED' || status === 'AWAITING_REVIEW' || status === 'READY_FOR_REVIEW') {
    return getDocumentProcessingStatusLabel(document.lifecycle, document.status);
  }
  if (['QUEUED', 'PROCESSING', 'ENRICHING', 'PENDING', 'ACCEPTED'].includes(status ?? '')) {
    return getDocumentProcessingStatusLabel(document.lifecycle, document.status);
  }
  if (['PREPARING', 'READY_FOR_SIGNATURE', 'SIGNED'].includes(lifecycle)) {
    return getDocumentLifecycleLabel(document.lifecycle);
  }
  return null;
}

function NeedsAttention({ docs }: { docs: Document[] }) {
  const items = docs.flatMap((document) => {
    const status = getAttentionStatus(document);
    return status ? [{ document, status }] : [];
  });

  return (
    <article className="h-fit w-full min-w-0 rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35 min-[1680px]:h-full">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-black text-[#071B33]">Needs attention</h2>
        <span className="text-xs font-semibold text-[#5B6F8A]">{items.length}</span>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map(({ document, status }) => (
            <li key={document.id} className="flex min-w-0 items-center justify-between gap-3 border-l-2 border-[#D7E4F2] py-1 pl-3">
              <div className="min-w-0 flex-1">
                <Link href={`/portal/documents/${document.id}`} className="inline-flex min-h-11 min-w-0 items-center truncate rounded-sm text-sm font-bold text-[#071B33] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">
                  {document.file_name}
                </Link>
                <p className="text-xs font-semibold text-[#5B6F8A]">Created {formatDate(document.created_at)}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${document.status ? getDocumentProcessingBadgeClasses(document.status) : getDocumentLifecycleBadgeClasses(document.lifecycle)}`}>
                {status}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-semibold text-[#5B6F8A]">No documents need attention.</p>
      )}
    </article>
  );
}

function StatusDistribution({ docs }: { docs: Document[] }) {
  const colors = ["#0879D8", "#59C878", "#9B6AF3", "#F6B52E", "#22C7D8", "#EF4444"];
  const lifecycleCounts = new Map<string, number>();
  for (const document of docs) {
    const label = getDocumentLifecycleLabel(document.lifecycle);
    lifecycleCounts.set(label, (lifecycleCounts.get(label) ?? 0) + 1);
  }
  const groups = [...lifecycleCounts].map(([label, count], index) => ({ label, count, color: colors[index % colors.length] }));
  const processingCounts = new Map<string, { status?: string | null; count: number }>();
  for (const document of docs) {
    const label = getDocumentProcessingStatusLabel(document.lifecycle, document.status);
    const group = processingCounts.get(label);
    if (group) group.count += 1;
    else processingCounts.set(label, { status: document.status, count: 1 });
  }
  if (!processingCounts.has('Failed')) processingCounts.set('Failed', { status: 'FAILED', count: 0 });
  const processingGroups = [...processingCounts].sort(([left], [right]) => left.localeCompare(right));
  const total = docs.length;
  let cursor = 0;
  const gradient = groups.map((g) => {
    const start = cursor;
    cursor += (g.count / total) * 100;
    return `${g.color} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <article className="flex h-fit w-full min-w-0 flex-col rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <h2 className="mb-4 text-lg font-black text-[#071B33]">Status Distribution</h2>
      <div className="grid min-w-0 items-center gap-3 sm:grid-cols-[128px_minmax(0,1fr)]">
        <div className="relative mx-auto size-32 rounded-full" style={{ background: total ? `conic-gradient(${gradient})` : 'conic-gradient(#E4EEF9 0% 100%)' }}>
          <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-2xl font-black tabular-nums text-[#071B33]">{total}</strong>
            <span className="text-xs font-semibold text-[#6B7E95]">Total documents</span>
          </div>
        </div>
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.label} className="flex items-center gap-3 text-sm">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: g.color }} />
              <span className="min-w-0 flex-1 font-semibold text-[#5B6F8A]">{g.label}</span>
              <strong className="font-black text-[#071B33]">{g.count}</strong>
              <span className="text-xs font-semibold text-[#5B6F8A]">({Math.round((g.count / total) * 100)}%)</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-[#E4EEF9] pt-2 text-sm" aria-label={`Total documents: ${total}`}>
            <span className="font-semibold text-[#5B6F8A]">Total documents</span>
            <strong className="tabular-nums text-[#071B33]">{total}</strong>
          </div>
          {total === 0 && <p className="text-sm font-semibold text-[#5B6F8A]">No documents to summarize yet.</p>}
        </div>
      </div>
      <section className="mt-5 border-t border-[#E4EEF9] pt-4" aria-labelledby="processing-status-heading">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h3 id="processing-status-heading" className="text-sm font-bold text-[#071B33]">Processing status</h3>
          <span className="text-xs font-semibold text-[#5B6F8A]">All documents</span>
        </div>
        {processingGroups.length > 0 ? (
          <ul className="space-y-2">
            {processingGroups.map(([label, group]) => (
              <li key={label} className="flex min-w-0 items-center justify-between gap-3 text-sm">
                <span className={`min-w-0 truncate rounded-full px-2.5 py-0.5 text-xs font-bold ${getDocumentProcessingBadgeClasses(group.status)}`}>{label}</span>
                <strong className="shrink-0 tabular-nums text-[#071B33]">{group.count}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-semibold text-[#5B6F8A]">No processing statuses yet.</p>
        )}
      </section>
    </article>
  );
}

export default function DocumentsPage() {
  const router = useRouter();
  const [selectedOwnership, setSelectedOwnership] = useState<'owned' | 'shared' | null>(null);
  const [search, setSearch] = useState('');
  const [lifecycle, setLifecycle] = useState('all');
  const [sort, setSort] = useState<DocumentListFilters['sort']>('newest');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdThrough, setCreatedThrough] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState("5");
  const [showCreateRecord, setShowCreateRecord] = useState(false);
  const documentsQuery = useQuery<Document[]>({ queryKey: ['portal-documents'], queryFn: fetchDocuments });
  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['portal-profile'],
    queryFn: async () => {
      const response = await portalRequest('/api/portal/proxy?path=%2Fusers%2F');
      return response.json();
    },
  });
  const allDocuments = documentsQuery.data ?? [];
  const uiRole = getPortalUiRole(profileQuery.data?.role);
  const isIssuer = uiRole === 'lawyer';
  const hasOwnershipTabs = uiRole === 'user';
  const ownership = selectedOwnership ?? (isIssuer ? 'owned' : 'shared');
  const documents = isIssuer ? allDocuments : getDocumentsByOwnership(allDocuments, ownership);
  const lifecycles = getDocumentLifecycles(documents);
  if (lifecycle !== 'all' && !lifecycles.includes(lifecycle)) lifecycles.push(lifecycle);
  const ownershipLabel = isIssuer ? 'office repository' : ownership === 'owned' ? 'My documents' : 'Shared with me';
  function changeOwnership(value: 'owned' | 'shared') {
    setSelectedOwnership(value);
    setPage(0);
  }
  const visibleDocuments = getVisibleDocuments(documents, {
    query: search,
    lifecycle,
    sort,
    createdFrom,
    createdThrough,
  });

  const perPage = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(visibleDocuments.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const pagedDocs = visibleDocuments.slice(safePage * perPage, (safePage + 1) * perPage);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="shrink-0 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-[#0C2B49]">Documents</h1>
          <p className="mt-1 text-sm text-[#64748b]">Manage and review documents in the office repository</p>
        </div>
        {isIssuer && <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setShowCreateRecord((open) => !open)} aria-expanded={showCreateRecord} className="rounded-full border border-[#0985E7] px-5 py-2.5 text-sm font-black text-[#0985E7]">Create document draft</button><Link href="/portal/upload" className="inline-flex items-center gap-2 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white"><FileUploadIcon sx={{ fontSize: 16 }} />Upload Document</Link></div>}
      </div>

      {isIssuer && showCreateRecord && <CreateDocumentRecordForm onClose={() => setShowCreateRecord(false)} onCreated={(id) => router.push(`/portal/documents/${id}`)} />}

      {hasOwnershipTabs && <div role="tablist" aria-label="Document ownership" className="flex shrink-0 gap-2">
        {(['owned', 'shared'] as const).map((value) => (
          <button key={value} id={`ownership-${value}`} type="button" role="tab" aria-selected={ownership === value} aria-controls="ownership-results" tabIndex={ownership === value ? 0 : -1}
            onClick={() => changeOwnership(value)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === 'Home' ? 'owned' : event.key === 'End' ? 'shared' : value === 'owned' ? 'shared' : 'owned';
              changeOwnership(next);
              document.getElementById(`ownership-${next}`)?.focus();
            }}
            className={cn('rounded-full border px-4 py-2 text-sm font-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]', ownership === value ? 'border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]' : 'border-[#E4EEF9] text-[#0C2B49]')}
          >{value === 'owned' ? 'My documents' : 'Shared with me'} ({getDocumentsByOwnership(allDocuments, value).length})</button>
        ))}
      </div>}
      <div id="ownership-results" role={hasOwnershipTabs ? 'tabpanel' : 'region'} aria-labelledby={hasOwnershipTabs ? `ownership-${ownership}` : undefined} aria-label={hasOwnershipTabs ? undefined : isIssuer ? 'Office document results' : 'Document results'} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto min-[1680px]:overflow-hidden">
      {documentsQuery.isLoading ? (
        <div className="flex flex-col gap-3" aria-label="Loading documents">{[1, 2, 3].map((index) => <div key={index} className="h-[80px] animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />)}</div>
      ) : documentsQuery.isError ? (
        <div role="alert" className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center"><p className="text-sm font-bold text-[#0C2B49]">{documentsErrorMessage(documentsQuery.error)}</p><p className="mt-1 text-xs text-[#64748b]">Check your connection and try again.</p><button type="button" onClick={() => void documentsQuery.refetch()} className="mt-4 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-black text-[#0985E7]">Retry</button></div>
      ) : allDocuments.length === 0 ? (
        <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
          <p className="text-sm font-bold text-[#0C2B49]">{search || lifecycle !== 'all' ? 'No documents match your search or filter' : 'No documents yet'}</p>
          <p className="mt-1 text-xs text-[#64748b]">{isIssuer ? 'Upload your first document to get started.' : 'No documents are available yet.'}</p>
          {isIssuer && <Link href="/portal/upload" className="mt-4 inline-flex rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white">Upload Document</Link>}
        </div>
      ) : (
        <>
          <section className="grid gap-4 min-[1680px]:min-h-0 min-[1680px]:flex-1 min-[1680px]:grid-cols-[minmax(0,1fr)_340px] min-[1680px]:overflow-hidden">
            <article className="flex min-w-0 flex-col rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35 min-[1680px]:min-h-0 min-[1680px]:overflow-hidden">
              <div className="border-b border-[#E4EEF9] p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="mr-auto shrink-0 text-lg font-black text-[#071B33]">Document Directory</h2>
                  <label className="flex w-full items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-2.5 focus-within:border-[#0985E7] sm:w-72">
                    <SearchIcon fontSize="small" className="text-[#4B6382]" />
                    <span className="sr-only">Search documents</span>
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents..." className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]" />
                  </label>
                  <div className="[&>div>button]:py-2.5">
                    <Dropdown description="Sort documents" value={sort} onChange={(value) => { setSort(value as DocumentListFilters['sort']); setPage(0); }} options={[{ label: "Newest first", value: "newest" }, { label: "Oldest first", value: "oldest" }, { label: "Name A–Z", value: "title" }]} />
                  </div>
                  <FilterDetails summary={<>
                      <FilterListIcon fontSize="small" />
                      More Filters{lifecycle !== 'all' || createdFrom || createdThrough ? ' •' : ''}
                    </>}>
                    <div className="absolute right-0 top-full z-50 mt-2 grid w-[min(440px,calc(100vw-3rem))] grid-cols-1 gap-4 rounded-xl border border-[#E4EEF9] bg-white p-4 text-sm font-semibold text-[#0C2B49] shadow-lg sm:grid-cols-2">
                      <div className="grid gap-1.5 sm:col-span-2 [&>div>button]:w-full [&>div>button]:justify-between"><span>Lifecycle</span>
                        <Dropdown description="Filter by lifecycle" value={lifecycle} onChange={(value) => { setLifecycle(value); setPage(0); }} options={[{ label: "All Lifecycles", value: "all" }, ...lifecycles.map((value) => ({ label: getDocumentLifecycleLabel(value), value }))]} />
                      </div>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label="Created from" localeText={getDatePickerLocaleText('Created from')} format="MM/DD/YYYY" value={createdFrom ? dayjs(createdFrom) : null} maxDate={createdThrough ? dayjs(createdThrough) : undefined}
                          onChange={(value, context) => { if (context.validationError) return; setCreatedFrom(value?.format('YYYY-MM-DD') ?? ''); setPage(0); }}
                          slotProps={getDatePickerSlotProps('Created from')} />
                        <DatePicker label="Created through" localeText={getDatePickerLocaleText('Created through')} format="MM/DD/YYYY" value={createdThrough ? dayjs(createdThrough) : null} minDate={createdFrom ? dayjs(createdFrom) : undefined}
                          onChange={(value, context) => { if (context.validationError) return; setCreatedThrough(value?.format('YYYY-MM-DD') ?? ''); setPage(0); }}
                          slotProps={getDatePickerSlotProps('Created through')} />
                      </LocalizationProvider>
                      <button type="button" onClick={() => { setLifecycle('all'); setCreatedFrom(''); setCreatedThrough(''); setSearch(''); setSort('newest'); setPage(0); }} className="rounded-xl bg-[#EEF4FB] py-2.5 text-[#0879D8] sm:col-span-2">Reset filters</button>
                    </div>
                  </FilterDetails>
                </div>
              </div>
              <div role="region" aria-label="Document directory results" tabIndex={0} className="admin-table-scroll hidden min-h-0 flex-1 overflow-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0985E7] min-[1240px]:block">
                <table className="w-full min-w-[920px] text-sm">
                  <caption className="sr-only">Documents in the office repository</caption>
                  <thead>
                    <tr className="border-b border-[#D9E5F0] bg-[#F8FBFF] text-left text-xs font-black uppercase tracking-[0.08em] text-[#4B6382]">
                      <th className="px-5 py-3">Document</th>
                      <th className="px-5 py-3">Lifecycle / processing</th>
                      <th className="px-5 py-3">On-chain</th>
                      <th className="px-5 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedDocs.map((doc) => (
                      <tr key={doc.id} className="h-[68px] border-b border-[#F1F5F9] transition hover:bg-[#F8FBFF]">
                        <td className="max-w-[260px] px-5 py-3">
                          <Link href={`/portal/documents/${doc.id}`} className="inline-flex min-h-11 max-w-full items-center truncate rounded-sm font-bold text-[#071B33] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">{doc.file_name}</Link>
                          <p className="mt-0.5 text-xs font-semibold text-[#5B6F8A]">{doc.doc_no != null ? `Register ${doc.doc_no}${doc.page_no != null ? ` · page ${doc.page_no}` : ''}` : 'Register entry unavailable'}</p>
                        </td>
                        <td className="px-5 py-3"><DocumentBadges document={doc} /></td>
                        <td className="px-5 py-3 text-xs font-bold text-[#5B6F8A]">{doc.on_chain ? 'Recorded' : 'Not recorded'}</td>
                        <td className="px-5 py-3 font-semibold text-[#5B6F8A]">{formatDate(doc.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="min-[1240px]:hidden flex flex-col gap-3 px-5 pb-4">
                {pagedDocs.map((document) => (
                  <article key={document.id} className="rounded-xl border border-[#E4EEF9] p-4">
                    <div className="flex gap-3">
                      <DescriptionIcon sx={{ fontSize: 20, color: '#5B6F8A' }} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <Link href={`/portal/documents/${document.id}`} className="inline-flex min-h-11 max-w-full items-center truncate rounded-sm text-sm font-bold text-[#071B33] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">{document.file_name}</Link>
                        <p className="mt-1 text-xs text-[#64748b]">{document.doc_no != null ? `Register ${document.doc_no}${document.page_no != null ? ` · page ${document.page_no}` : ''}` : 'Register entry unavailable'} · Created {formatDate(document.created_at)}</p>
                        <p className="mt-1 text-xs font-semibold text-[#5B6F8A]">{document.on_chain ? 'Recorded on-chain' : 'Not recorded on-chain'}</p>
                        <div className="mt-2"><DocumentBadges document={document} /></div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {pagedDocs.length === 0 && (
                <div className="px-5 py-6 text-center text-sm font-semibold text-[#5B6F8A]">
                  <p>{documents.length === 0 ? `No documents in ${ownershipLabel} yet` : `No matching documents in ${ownershipLabel}`}</p>
                  {search.trim() && <button type="button" onClick={() => { setSearch(''); setPage(0); }} className="mt-4 min-h-11 rounded-full border border-[#D7E4F2] px-4 text-sm font-black text-[#0985E7] hover:bg-[#EEF4FB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">Clear search</button>}
                </div>
              )}
              <div className="flex shrink-0 flex-col gap-3 border-t border-[#E4EEF9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-[#5B6F8A]">Showing {visibleDocuments.length === 0 ? 0 : safePage * perPage + 1}–{Math.min((safePage + 1) * perPage, visibleDocuments.length)} of {visibleDocuments.length} documents</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={safePage === 0} aria-label="Previous page" className="rounded-lg border border-[#E4EEF9] p-2 text-[#4B6382] transition hover:bg-[#EEF4FB] disabled:opacity-35">
                    <ChevronLeftIcon fontSize="small" />
                  </button>
                  {[...Array(Math.min(3, totalPages))].map((_, index) => (
                    <button key={index} type="button" onClick={() => setPage(index)} className={cn("size-9 rounded-lg border text-sm font-black transition", safePage === index ? "border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]" : "border-[#E4EEF9] text-[#0C2B49] hover:bg-[#EEF4FB]")}>{index + 1}</button>
                  ))}
                  {totalPages > 3 && <span className="px-2 text-sm font-black text-[#5B6F8A]">...</span>}
                  <button type="button" onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={safePage >= totalPages - 1} aria-label="Next page" className="rounded-lg border border-[#E4EEF9] p-2 text-[#4B6382] transition hover:bg-[#EEF4FB] disabled:opacity-35">
                    <ChevronRightIcon fontSize="small" />
                  </button>
                  <Dropdown description="Documents per page" openUp value={pageSize} onChange={setPageSize} options={[{ label: "5 / page", value: "5" }, { label: "10 / page", value: "10" }, { label: "20 / page", value: "20" }]} />
                </div>
              </div>
            </article>
            <aside className="grid min-h-0 min-w-0 content-start gap-4 min-[1680px]:grid-rows-[auto_minmax(0,1fr)] min-[1680px]:overflow-auto">
              <StatusDistribution docs={documents} />
              <NeedsAttention docs={documents} />
            </aside>
          </section>
        </>
      )}
      </div>
    </div>
  );
}
