'use client';

import Link from 'next/link';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import type { PortalUiRole } from '../lib/portal-role';
import { PortalSearchBar } from './portal-search-bar';

type PortalTopBarProps = {
  fullName: string;
  initials: string;
  roleLabel: string;
  role: PortalUiRole;
  processingCount: number;
};

export function PortalTopBar({ fullName, initials, roleLabel, role, processingCount }: PortalTopBarProps) {
  const processingLabel = processingCount === 1 ? '1 document processing' : `${processingCount} documents processing`;

  return (
    <header className="sticky top-0 z-40 -mx-6 mb-6 border-b border-[var(--portal-border-soft)] bg-[var(--portal-surface)] px-4 md:px-6">
      <div className="flex min-h-16 items-center gap-3">
        <PortalSearchBar />
        {role === 'issuer' ? (
          <Link
            href="/portal/dashboard"
            aria-label="View processing documents"
            className="hidden rounded-full bg-[#FFF4DD] px-3 py-1.5 text-xs font-bold text-[#9A6700] transition hover:bg-[#FFE9BD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7] lg:inline-flex"
          >
            {processingLabel}
          </Link>
        ) : null}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/portal/notifications"
            aria-label="View notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--portal-border-soft)] transition-colors hover:bg-[var(--portal-surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]"
          >
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 20, color: 'var(--portal-navy)' }} />
          </Link>
          <a
            href="mailto:support@lexchain.app"
            aria-label="Get help"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--portal-border-soft)] transition-colors hover:bg-[var(--portal-surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7] sm:flex"
          >
            <span aria-hidden="true" className="text-base font-black leading-none text-[var(--portal-navy)]">?</span>
          </a>
          <div className="hidden min-w-0 text-right lg:block">
            <p className="truncate text-sm font-black text-[var(--portal-navy)]">{fullName}</p>
            <p className="truncate text-xs font-semibold text-[var(--portal-text-muted)]">{roleLabel}</p>
          </div>
          <div aria-label={`${fullName} profile`} className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--portal-surface-soft)] text-xs font-bold text-[var(--portal-primary)]">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
