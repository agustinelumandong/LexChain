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

export function PortalBottomNav({ pathname }: { pathname: string }) {
  return (
    <>
      {/* Mobile: floating pill nav like native app */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(215,235,255,0.9), rgba(243,248,255,0))' }}
      >
        <div className="flex items-center gap-4 px-4 pb-6 pt-9 pointer-events-auto w-full mx-auto">
          <nav className="flex-1 flex items-center gap-1 p-[3px] min-h-[62px] rounded-[30px] bg-white shadow-[0_10px_18px_rgba(22,137,245,0.08)]">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className={`flex-1 flex flex-col items-center justify-center gap-[3px] min-h-[56px] rounded-[28px] transition-colors ${active ? 'bg-[var(--portal-surface-soft)]' : ''}`}
                >
                  <Icon sx={{ fontSize: 18, color: active ? 'var(--portal-primary)' : 'var(--portal-text-muted)' }} />
                  {active && (
                    <span className="text-[10px] font-bold leading-[12px] text-[var(--portal-primary)]">{label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/portal/upload"
            aria-label="Upload document"
            className="shrink-0 w-[62px] h-[62px] flex items-center justify-center rounded-3xl bg-[var(--portal-primary)] shadow-[0_12px_20px_rgba(22,137,245,0.16)]"
          >
            <FileUploadIcon sx={{ fontSize: 22, color: '#fff' }} />
          </Link>
        </div>
      </div>

      {/* Desktop: floating pill nav with text labels */}
      <div className="hidden md:flex fixed bottom-6 left-0 right-0 z-50 justify-center pointer-events-none">
        <nav className="flex items-center gap-2 px-3 py-4 rounded-full bg-white border border-[var(--portal-border-soft)] shadow-[0_10px_18px_rgba(22,137,245,0.08)] pointer-events-auto">
          {[...navItems, { label: 'Upload', href: '/portal/upload', icon: FileUploadIcon }].map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-[var(--portal-primary)] text-white'
                    : 'text-[var(--portal-text-muted)] hover:text-[var(--portal-primary)] hover:bg-[var(--portal-surface-soft)]'
                }`}
              >
                <Icon sx={{ fontSize: 16 }} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
