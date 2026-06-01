'use client';

import Link from 'next/link';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupsIcon from '@mui/icons-material/Groups';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';

const mockKpis = [
  { label: 'Total Documents', value: '3', icon: DescriptionIcon },
  { label: 'Processing', value: '1', icon: ScheduleIcon },
  { label: 'On Chain Records', value: '2', icon: VerifiedUserIcon },
  { label: 'Pending Invites', value: '0', icon: GroupsIcon },
];

const mockActivities = [
  { id: '1', title: 'Lease Agreement - Rivera...', detail: 'Blockchain record confirmed and ready for viewing.', time: 'May 22, 5:15 PM', status: 'Anchored', tone: 'success' as const },
  { id: '2', title: 'DepEd Memorandum No. ...', detail: 'Blockchain record confirmed and ready for viewing.', time: 'May 9, 2:03 AM', status: 'Anchored', tone: 'success' as const },
  { id: '3', title: 'Power of Attorney - Mart...', detail: 'Document analysis and hash preparation are in progress.', time: 'Apr 15, 7:00 PM', status: 'Processing', tone: 'warning' as const },
];

const toneStyles = {
  success: 'bg-[#EAF8F0] text-[#12A150]',
  warning: 'bg-[#FFF4DD] text-[#B77900]',
  info: 'bg-[#EAF4FF] text-[#1689F5]',
};

const toneIconBg = {
  success: 'bg-[#EEF6FF]',
  warning: 'bg-[#EEF6FF]',
  info: 'bg-[#F5EAFE]',
};

const cardClass = 'bg-white rounded-[18px] border border-[#E8F0F8] shadow-[0_4px_12px_rgba(19,59,115,0.05)]';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Greeting + Actions row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-black leading-[34px] text-[#0C2B49]">
            Good morning, Atty. Reyes
          </h1>
          <p className="text-sm font-medium text-[#64748b] mt-1">
            Manage and verify your legal documents
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
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#0985E7] text-white text-[10px] font-black flex items-center justify-center px-1">2</span>
          </Link>
          <Link href="/portal/upload" className="flex items-center gap-2 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0770c4]">
            <FileUploadIcon sx={{ fontSize: 18 }} />
            Upload Document
          </Link>
        </div>
      </div>

      {/* KPI Row — 4 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKpis.map((kpi) => (
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

      {/* Two column: Activity (left) + Status Overview & Quick Actions (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Recent Activity */}
        <div className={`${cardClass} p-5 flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#0C2B49]">Recent Activity</h2>
            <Link href="/portal/documents" className="text-xs font-black text-[#0985E7]">View all</Link>
          </div>

          <div className="flex flex-col divide-y divide-[#E8F0F8]">
            {mockActivities.map((activity) => (
              <Link key={activity.id} href={`/portal/documents/doc-${activity.id}`} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className={`w-[44px] h-[44px] rounded-xl ${toneIconBg[activity.tone]} flex items-center justify-center shrink-0`}>
                  <DescriptionIcon sx={{ fontSize: 20, color: '#0985E7' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0C2B49] truncate">{activity.title}</span>
                    <span className={`${toneStyles[activity.tone]} rounded-full py-0.5 px-2.5 text-[11px] font-bold shrink-0`}>{activity.status}</span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">{activity.detail}</p>
                  <p className="text-[11px] font-bold text-[#A0AAB8] mt-1">{activity.time}</p>
                </div>
                <ChevronRightIcon sx={{ fontSize: 20, color: '#A0AAB8' }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Document Status Overview */}
          <div className={`${cardClass} p-5`}>
            <h3 className="text-base font-black text-[#0C2B49] mb-4">Document Status Overview</h3>
            <div className="flex items-center gap-6">
              {/* Simple donut placeholder */}
              <div className="w-[100px] h-[100px] rounded-full border-[12px] border-[#0985E7] border-t-[#12A150] border-r-[#12A150] shrink-0" />
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#12A150]" /><span className="text-[#0C2B49] font-medium">Anchored</span><span className="ml-auto font-bold text-[#0C2B49]">2 (50%)</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#0985E7]" /><span className="text-[#0C2B49] font-medium">Processing</span><span className="ml-auto font-bold text-[#0C2B49]">1 (25%)</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /><span className="text-[#0C2B49] font-medium">Pending Invites</span><span className="ml-auto font-bold text-[#0C2B49]">0 (10%)</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB]" /><span className="text-[#0C2B49] font-medium">Other</span><span className="ml-auto font-bold text-[#0C2B49]">1 (25%)</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8F0F8]">
              <span className="text-sm font-bold text-[#0985E7]">Total Documents</span>
              <span className="text-2xl font-black text-[#0C2B49]">4</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${cardClass} p-5`}>
            <h3 className="text-base font-black text-[#0C2B49] mb-3">Quick Actions</h3>
            <div className="flex flex-col divide-y divide-[#E8F0F8]">
              <Link href="/portal/upload" className="flex items-center gap-3 py-3 first:pt-0">
                <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] flex items-center justify-center">
                  <FileUploadIcon sx={{ fontSize: 18, color: '#0985E7' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-[#0C2B49] block">Upload Document</span>
                  <span className="text-[11px] text-[#64748b]">Add a new legal document</span>
                </div>
                <ChevronRightIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
              </Link>
              <Link href="/portal/documents" className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] flex items-center justify-center">
                  <GroupsIcon sx={{ fontSize: 18, color: '#0985E7' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-[#0C2B49] block">Invite Party</span>
                  <span className="text-[11px] text-[#64748b]">Invite others to collaborate</span>
                </div>
                <ChevronRightIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
              </Link>
              <Link href="/portal/documents" className="flex items-center gap-3 py-3 last:pb-0">
                <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] flex items-center justify-center">
                  <VerifiedUserIcon sx={{ fontSize: 18, color: '#0985E7' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-[#0C2B49] block">Verify Document</span>
                  <span className="text-[11px] text-[#64748b]">Verify document authenticity</span>
                </div>
                <ChevronRightIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
