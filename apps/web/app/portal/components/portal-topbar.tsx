'use client';

import Link from 'next/link';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

export function PortalTopBar() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--portal-surface)] border-b border-[var(--portal-border-soft)]">
      <div className="mx-auto max-w-3xl flex items-center justify-between h-14 px-4">
        <span className="text-lg font-[900] font-['Montserrat'] text-[var(--portal-navy)]">
          LexChain
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/portal/notifications"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--portal-border-soft)] hover:bg-[var(--portal-surface-soft)] transition-colors"
          >
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 20, color: 'var(--portal-navy)' }} />
          </Link>
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--portal-surface-soft)] text-[var(--portal-primary)] text-xs font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
