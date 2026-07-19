'use client';

import Link from 'next/link';
import { getPortalNavigation } from '../lib/portal-dashboard';
import { getPortalNavigationIcon, isPortalRouteActive } from './portal-role-navigation';

export function PortalBottomNav({ pathname }: { pathname: string }) {
  const navItems = getPortalNavigation('issuer');

  return (
    <>
      {/* Mobile: floating pill nav like native app */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(215,235,255,0.9), rgba(243,248,255,0))' }}
      >
        <div className="flex items-center gap-4 px-4 pb-6 pt-9 pointer-events-auto w-full mx-auto">
          <nav className="flex-1 flex items-center gap-1 p-[3px] min-h-[62px] rounded-[30px] bg-white shadow-[0_10px_18px_rgba(22,137,245,0.08)]">
            {navItems.map((item) => {
              const active = isPortalRouteActive(pathname, item);
              const Icon = getPortalNavigationIcon(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className={`flex-1 flex flex-col items-center justify-center gap-[3px] min-h-[56px] rounded-[28px] transition-colors ${active ? 'bg-[var(--portal-surface-soft)]' : ''}`}
                >
                  <span className={active ? 'text-[var(--portal-primary)]' : 'text-[var(--portal-text-muted)]'}>
                    <Icon fontSize="small" />
                  </span>
                  {active && (
                    <span className="text-[10px] font-bold leading-[12px] text-[var(--portal-primary)]">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
