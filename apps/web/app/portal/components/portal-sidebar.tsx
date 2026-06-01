'use client';

import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const navItems = [
  { label: 'Home', href: '/portal/dashboard', icon: HomeIcon },
  { label: 'Documents', href: '/portal/documents', icon: DescriptionIcon },
  { label: 'Profile', href: '/portal/profile', icon: PersonIcon },
];

export function PortalSidebar({ pathname }: { pathname: string }) {
  return (
    <aside
      role="navigation"
      aria-label="Main navigation"
      className="w-[240px] shrink-0 flex flex-col border-r border-[var(--portal-border-soft)] bg-[var(--portal-surface)]"
    >
      <div className="p-6">
        <span className="text-2xl font-[900] font-['Montserrat'] text-[var(--portal-navy)]">
          LexChain
        </span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[var(--portal-surface-soft)] text-[var(--portal-primary)]' : 'text-[var(--portal-text-muted)] hover:bg-[var(--portal-surface-soft)]'}`}
            >
              <Icon fontSize="small" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <Link
          href="/portal/upload"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--portal-primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <FileUploadIcon fontSize="small" />
          Upload
        </Link>
      </div>
    </aside>
  );
}
