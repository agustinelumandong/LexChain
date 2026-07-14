'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupsIcon from '@mui/icons-material/Groups';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import type { ApiSchema } from '@lexchain/types';
import { getDashboardMetrics } from '../lib/portal-dashboard';
import { getPortalUiRole } from '../lib/portal-role';

interface Document {
  id: string;
  file_name: string;
  status: string;
  on_chain: boolean;
  created_at: string;
}

type UserProfile = ApiSchema<'UserProfileResponse'>;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`/api/portal/proxy?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

const cardClass = 'bg-white rounded-[18px] border border-[#E8F0F8] shadow-[0_4px_12px_rgba(19,59,115,0.05)]';

function statusTone(status: string): 'success' | 'warning' | 'info' {
  const s = status?.toLowerCase();
  if (s === 'anchored' || s === 'completed') return 'success';
  if (s === 'processing' || s === 'pending') return 'warning';
  return 'info';
}

const toneStyles = {
  success: 'bg-[#EAF8F0] text-[#12A150]',
  warning: 'bg-[#FFF4DD] text-[#B77900]',
  info: 'bg-[#EAF4FF] text-[#1689F5]',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function getMetricIcon(label: string) {
  if (label === 'Processing') return ScheduleIcon;
  if (label === 'On-Chain Records') return VerifiedUserIcon;
  if (label === 'Pending Invites' || label === 'Recent Access') return GroupsIcon;
  return DescriptionIcon;
}

export default function DashboardPage() {
  const documentsQuery = useQuery<Document[]>({
    queryKey: ['portal-documents'],
    queryFn: () => fetchJson('/documents/'),
  });

  const { data: notifCount } = useQuery<{ unread: number }>({
    queryKey: ['portal-notif-count'],
    queryFn: () => fetchJson('/notifications/unread-count'),
  });

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ['portal-profile'],
    queryFn: () => fetchJson('/users/'),
  });

  const uiRole = getPortalUiRole(profile?.role);
  const isIssuer = uiRole === 'issuer';
  const documents = documentsQuery.data ?? [];
  const total = documents.length;
  const processing = documents.filter(d => d.status?.toLowerCase() === 'processing' || d.status?.toLowerCase() === 'pending').length;
  const recent = [...documents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  // Status overview counts
  const anchored = documents.filter(d => d.status?.toLowerCase() === 'anchored' || d.status?.toLowerCase() === 'completed').length;
  const other = total - anchored - processing;

  const kpis = getDashboardMetrics(uiRole, documents).map(([label, value]) => ({
    label,
    value,
    icon: getMetricIcon(label),
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting + Actions row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-black leading-[34px] text-[#0C2B49]">Good morning</h1>
          <p className="text-sm font-medium text-[#64748b] mt-1">
            {isIssuer ? 'Manage and verify your legal documents' : 'View shared documents and verification activity'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#E8F0F8] bg-[#F8FBFF] px-4 py-2.5 min-w-[200px]">
            <SearchIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
            <span className="text-sm text-[#A0AAB8]">Search documents...</span>
            <span className="ml-auto text-[11px] font-bold text-[#A0AAB8] border border-[#E8F0F8] rounded px-1.5 py-0.5">⌘K</span>
          </div>
          <Link href="/portal/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E8F0F8] transition hover:bg-[#F5FAFF]">
            <NotificationsNoneIcon sx={{ fontSize: 20, color: '#0C2B49' }} />
            {(notifCount?.unread ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#0985E7] text-white text-[10px] font-black flex items-center justify-center px-1">
                {notifCount!.unread}
              </span>
            )}
          </Link>
          {isIssuer && <Link href="/portal/upload" className="flex items-center gap-2 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0770c4]">
            <FileUploadIcon sx={{ fontSize: 18 }} />
            Upload Document
          </Link>}
        </div>
      </div>

      {documentsQuery.isError && <div role="alert" className={`${cardClass} flex flex-wrap items-center justify-between gap-3 p-5`}><p className="text-sm font-bold text-[#0C2B49]">Unable to load documents. Please try again.</p><button type="button" onClick={() => void documentsQuery.refetch()} className="rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-black text-[#0985E7]">Retry</button></div>}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${cardClass} px-6 py-6 flex items-center gap-4`}>
            <div className="w-[52px] h-[52px] rounded-full bg-[#EEF6FF] flex items-center justify-center shrink-0 border border-[#D7EBFF]">
              <kpi.icon sx={{ fontSize: 24, color: '#0985E7' }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-bold text-[#64748b] block truncate">{kpi.label}</span>
              <span className="text-[40px] font-black leading-[46px] text-[#0C2B49] tabular-nums">{kpi.value}</span>
            </div>
            <ChevronRightIcon sx={{ fontSize: 20, color: '#A0AAB8' }} />
          </div>
        ))}
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Recent Activity */}
        <div className={`${cardClass} p-5 flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#0C2B49]">Recent Activity</h2>
            <Link href="/portal/documents" className="text-xs font-black text-[#0985E7]">View all</Link>
          </div>
          {documentsQuery.isError ? <p className="text-sm text-[#64748b] py-4 text-center">Document activity is unavailable until the retry succeeds.</p> : recent.length === 0 ? (
            <p className="text-sm text-[#64748b] py-4 text-center">No documents yet.{isIssuer ? ' Upload your first document.' : ''}</p>
          ) : (
            <div className="flex flex-col divide-y divide-[#E8F0F8]">
              {recent.map((doc) => {
                const tone = statusTone(doc.status);
                return (
                  <Link key={doc.id} href={`/portal/documents/${doc.id}`} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-[44px] h-[44px] rounded-xl bg-[#EEF6FF] flex items-center justify-center shrink-0">
                      <DescriptionIcon sx={{ fontSize: 20, color: '#0985E7' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#0C2B49] truncate">{doc.file_name}</span>
                        <span className={`${toneStyles[tone]} rounded-full py-0.5 px-2.5 text-[11px] font-bold shrink-0 capitalize`}>{doc.status}</span>
                      </div>
                      <p className="text-[11px] font-bold text-[#A0AAB8] mt-1">{formatDate(doc.created_at)}</p>
                    </div>
                    <ChevronRightIcon sx={{ fontSize: 20, color: '#A0AAB8' }} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Document Status Overview */}
          <div className={`${cardClass} p-5`}>
            <h3 className="text-base font-black text-[#0C2B49] mb-4">Document Status Overview</h3>
            <div className="flex items-center gap-6">
              <div className="w-[100px] h-[100px] rounded-full border-[12px] border-[#0985E7] border-t-[#12A150] border-r-[#12A150] shrink-0" />
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#12A150]" /><span className="text-[#0C2B49] font-medium">Anchored</span><span className="ml-auto font-bold text-[#0C2B49] pl-4">{anchored} ({total ? Math.round(anchored/total*100) : 0}%)</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#0985E7]" /><span className="text-[#0C2B49] font-medium">Processing</span><span className="ml-auto font-bold text-[#0C2B49] pl-4">{processing} ({total ? Math.round(processing/total*100) : 0}%)</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" /><span className="text-[#0C2B49] font-medium">Other</span><span className="ml-auto font-bold text-[#0C2B49] pl-4">{other} ({total ? Math.round(other/total*100) : 0}%)</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8F0F8]">
              <span className="text-sm font-bold text-[#0985E7]">Total Documents</span>
              <span className="text-2xl font-black text-[#0C2B49]">{total}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${cardClass} p-5`}>
            <h3 className="text-base font-black text-[#0C2B49] mb-3">Quick Actions</h3>
            <div className="flex flex-col divide-y divide-[#E8F0F8]">
              {isIssuer && <Link href="/portal/upload" className="flex items-center gap-3 py-3 first:pt-0">
                <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] flex items-center justify-center"><FileUploadIcon sx={{ fontSize: 18, color: '#0985E7' }} /></div>
                <div className="flex-1 min-w-0"><span className="text-sm font-bold text-[#0C2B49] block">Upload Document</span><span className="text-[11px] text-[#64748b]">Add a new legal document</span></div>
                <ChevronRightIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
              </Link>}
              {isIssuer && (
                <Link href="/portal/books" className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] flex items-center justify-center"><MenuBookIcon sx={{ fontSize: 18, color: '#0985E7' }} /></div>
                  <div className="flex-1 min-w-0"><span className="text-sm font-bold text-[#0C2B49] block">Register books</span><span className="text-[11px] text-[#64748b]">Manage physical register volumes</span></div>
                  <ChevronRightIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
                </Link>
              )}
              <Link href="/portal/documents" className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] flex items-center justify-center"><GroupsIcon sx={{ fontSize: 18, color: '#0985E7' }} /></div>
                <div className="flex-1 min-w-0"><span className="text-sm font-bold text-[#0C2B49] block">Invite Party</span><span className="text-[11px] text-[#64748b]">Invite others to collaborate</span></div>
                <ChevronRightIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
              </Link>
              <Link href="/portal/documents" className="flex items-center gap-3 py-3 last:pb-0">
                <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] flex items-center justify-center"><VerifiedUserIcon sx={{ fontSize: 18, color: '#0985E7' }} /></div>
                <div className="flex-1 min-w-0"><span className="text-sm font-bold text-[#0C2B49] block">Verify Document</span><span className="text-[11px] text-[#64748b]">Verify document authenticity</span></div>
                <ChevronRightIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
