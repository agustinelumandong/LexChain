'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldIcon from '@mui/icons-material/Shield';
import HistoryIcon from '@mui/icons-material/History';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PortalChatbot from '../../components/portal-chatbot';

const mockDocument = {
  id: 'doc-1',
  title: 'Contract Agreement.pdf',
  reference: 'DOC-2026-0528-A1',
  contentType: 'Service Agreement',
  date: 'May 28, 2026',
  status: 'COMPLETED',
  onChain: true,
  anchoredAt: 'May 28, 2026 at 14:32 UTC',
  summary: 'This is a standard service agreement between Party A (LexChain Corp) and Party B (Acme Inc) for software development services. The contract spans 12 months with automatic renewal.',
  entities: ['LexChain Corp', 'Acme Inc', 'John Smith (Signatory)', 'Jane Doe (Witness)'],
  riskFlags: ['Auto-renewal clause without notice period', 'Unlimited liability for Party B'],
  obligations: ['Monthly payment of $5,000 due by 15th', 'Quarterly progress reports', 'Annual security audit'],
  allowedCount: 4,
  partyNames: ['John Smith', 'Jane Doe', 'Mike Johnson'],
  versions: [
    { id: 'v2', label: 'Version 2', date: 'May 28', description: 'Updated terms section', isCurrent: true, statusLabel: 'Current' },
    { id: 'v1', label: 'Version 1', date: 'May 25', description: 'Original upload', isCurrent: false, statusLabel: null },
  ],
};

const cardClass = 'bg-white rounded-3xl p-5 shadow-[0_4px_16px_rgba(19,59,115,0.06)] overflow-hidden';

function DetailSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={cardClass}>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-full bg-[var(--portal-surface-soft)] flex items-center justify-center">
            <Icon sx={{ fontSize: 22, color: 'var(--portal-primary)' }} />
          </div>
          <span className="text-[15px] font-extrabold text-[var(--portal-navy)]">{title}</span>
        </div>
        <ExpandMoreIcon sx={{ fontSize: 20, color: 'var(--portal-text-muted)' }} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function DocumentDetailPage() {
  const { id } = useParams();

  return (
    <div className="flex flex-col gap-5 w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link href="/portal/documents" className="flex items-center gap-1.5 text-sm font-bold text-[var(--portal-primary)] w-fit">
          <ArrowBackIcon sx={{ fontSize: 16 }} /> Back
        </Link>
        <span className="text-xs font-bold text-[var(--portal-primary)] uppercase tracking-[0.5px]">DOCUMENT DETAILS</span>
        <h1 className="text-2xl font-extrabold leading-[30px] text-[var(--portal-navy)]">{mockDocument.title}</h1>
        <p className="text-[13px] font-medium leading-[19px] text-[var(--portal-text-muted)]">
          AI summary, verification status, ownership history, risk review, and searchable details.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Link href={`/portal/documents/${id}/viewer`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[var(--portal-primary)] text-white text-sm font-extrabold">
          View PDF
        </Link>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-[var(--portal-border-soft)] text-sm font-extrabold text-[var(--portal-navy)]">
          <SearchIcon sx={{ fontSize: 16 }} /> Search
        </button>
      </div>

      {/* 1. Document Summary Card */}
      <div className={cardClass}>
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-[42px] h-[42px] rounded-full bg-[var(--portal-surface-soft)] flex items-center justify-center">
            <DescriptionIcon sx={{ fontSize: 22, color: 'var(--portal-primary)' }} />
          </div>
          <span className="text-lg font-extrabold leading-[22px] text-[var(--portal-navy)]">Document summary</span>
        </div>
        <div className="flex flex-col gap-[13px]">
          <div className="flex justify-between"><span className="text-xs font-bold text-[var(--portal-text-muted)]">Reference</span><span className="text-xs font-extrabold text-[var(--portal-navy)]">{mockDocument.reference}</span></div>
          <div className="flex justify-between"><span className="text-xs font-bold text-[var(--portal-text-muted)]">Type</span><span className="text-xs font-extrabold text-[var(--portal-navy)]">{mockDocument.contentType}</span></div>
          <div className="flex justify-between"><span className="text-xs font-bold text-[var(--portal-text-muted)]">Uploaded</span><span className="text-xs font-extrabold text-[var(--portal-navy)]">{mockDocument.date}</span></div>
          <div className="h-px bg-[var(--portal-border-soft)]" />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[var(--portal-text-muted)]">Short summary</span>
            <p className="text-[13px] font-medium leading-[18px] text-[var(--portal-navy)]">{mockDocument.summary}</p>
          </div>
        </div>
      </div>

      {/* 2. Blockchain Status Card */}
      <div className={`${cardClass} flex items-start gap-4`}>
        <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 ${mockDocument.onChain ? 'bg-[var(--portal-surface-soft)]' : 'bg-[#FDECEF]'}`}>
          <VerifiedUserIcon sx={{ fontSize: 24, color: mockDocument.onChain ? 'var(--portal-primary)' : 'var(--portal-danger)' }} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="text-[15px] font-extrabold text-[var(--portal-navy)]">Blockchain status</span>
          <p className="text-[13px] font-medium text-[var(--portal-text-muted)]">
            {mockDocument.onChain ? 'This document hash has been recorded on-chain and can be independently verified.' : 'This document is not yet recorded on-chain.'}
          </p>
          <span className="text-xs font-bold text-[var(--portal-text-muted)]">
            {mockDocument.onChain ? `Anchored ${mockDocument.anchoredAt}` : 'Not anchored yet'}
          </span>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold shrink-0 ${mockDocument.onChain ? 'bg-[var(--portal-surface-soft)] text-[var(--portal-primary)]' : 'bg-[#FDECEF] text-[var(--portal-danger)]'}`}>
          {mockDocument.onChain ? 'Anchored' : 'Not anchored'}
        </span>
      </div>

      {/* 3. Access Control Card */}
      <div className={`${cardClass} flex items-start gap-4`}>
        <div className="w-[42px] h-[42px] rounded-full bg-[var(--portal-surface-soft)] flex items-center justify-center shrink-0">
          <ShieldIcon sx={{ fontSize: 24, color: 'var(--portal-primary)' }} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="text-[15px] font-extrabold text-[var(--portal-navy)]">Access control</span>
          <p className="text-[13px] font-medium text-[var(--portal-text-muted)]">Manage who can view or verify this document.</p>
          <span className="text-xs font-bold text-[var(--portal-text-muted)]">{mockDocument.allowedCount} people have access</span>
        </div>
        <button className="shrink-0 px-3 py-2 rounded-full border border-[var(--portal-border-soft)] text-xs font-extrabold text-[var(--portal-navy)]">
          Manage
        </button>
      </div>

      {/* 4. Version History Card */}
      <div className={cardClass}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[42px] h-[42px] rounded-full bg-[var(--portal-surface-soft)] flex items-center justify-center">
            <HistoryIcon sx={{ fontSize: 24, color: 'var(--portal-primary)' }} />
          </div>
          <span className="text-[15px] font-extrabold text-[var(--portal-navy)]">Version history</span>
        </div>
        <div className="flex flex-col">
          {mockDocument.versions.map((version, index) => (
            <div key={version.id} className="flex items-start gap-3 relative">
              {/* Date */}
              <span className={`w-12 text-[11px] font-bold shrink-0 pt-0.5 ${version.isCurrent ? 'text-[var(--portal-primary)]' : 'text-[var(--portal-text-muted)]'}`}>
                {version.date}
              </span>
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 ${version.isCurrent ? 'bg-[var(--portal-primary)]' : 'bg-[var(--portal-border-soft)]'}`} />
                {index < mockDocument.versions.length - 1 && <div className="w-px flex-1 bg-[var(--portal-border-soft)] min-h-[32px]" />}
              </div>
              {/* Content */}
              <div className="flex-1 pb-4 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${version.isCurrent ? 'text-[var(--portal-navy)]' : 'text-[var(--portal-text-muted)]'}`}>{version.label}</span>
                    {version.statusLabel && <span className="text-[10px] font-extrabold text-[var(--portal-primary)] bg-[var(--portal-surface-soft)] rounded-full px-2 py-0.5">{version.statusLabel}</span>}
                  </div>
                  <span className="text-xs font-medium text-[var(--portal-text-muted)]">{version.description}</span>
                </div>
                <ChevronRightIcon sx={{ fontSize: 20, color: 'var(--portal-text-muted)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENT INSIGHTS eyebrow */}
      <span className="text-xs font-extrabold text-[var(--portal-primary)] uppercase tracking-[0.5px] mt-0.5">DOCUMENT INSIGHTS</span>

      {/* 5. Risk Review */}
      <DetailSection title="Risk review" icon={WarningAmberIcon}>
        <div className="flex flex-col gap-2">
          {mockDocument.riskFlags.map((flag, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--portal-warning)] mt-1.5 shrink-0" />
              <span className="text-[13px] font-medium text-[var(--portal-navy)]">{flag}</span>
            </div>
          ))}
        </div>
      </DetailSection>

      {/* 6. Extracted Information */}
      <DetailSection title="Extracted information" icon={DescriptionIcon}>
        <div className="flex flex-col gap-2">
          {mockDocument.entities.map((entity, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--portal-primary)] mt-1.5 shrink-0" />
              <span className="text-[13px] font-medium text-[var(--portal-navy)]">{entity}</span>
            </div>
          ))}
        </div>
      </DetailSection>

      {/* 7. Confidence Card */}
      <div className={`${cardClass} flex items-center gap-3`}>
        <div className="w-[42px] h-[42px] rounded-full bg-[var(--portal-success-soft)] flex items-center justify-center">
          <VerifiedUserIcon sx={{ fontSize: 20, color: 'var(--portal-success)' }} />
        </div>
        <div className="flex-1">
          <span className="text-sm font-extrabold text-[var(--portal-navy)]">AI Confidence</span>
          <p className="text-xs font-medium text-[var(--portal-text-muted)]">Summary and extraction are ready and verified.</p>
        </div>
      </div>

      {/* Notarize / Verify action */}
      {mockDocument.onChain && (
        <Link href={`/portal/documents/${id}/verify`} className="flex items-center justify-center w-full py-3 rounded-full bg-[var(--portal-primary)] text-white text-sm font-extrabold">
          Verify on Chain
        </Link>
      )}

      <PortalChatbot />
    </div>
  );
}
