'use client';

import Link from 'next/link';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { getPortalNavigation } from '@/features/portal/portal-dashboard';
import type { PortalUiRole } from "@/features/access";
import { getPortalNavigationIcon, isPortalRouteActive } from "@/features/access/components";
import { usePopup } from '@/shared/components/ui/use-popup';

const MAX_BOTTOM_NAV_SLOTS = 5;
const navSlotClass = 'flex min-h-[56px] w-full min-w-0 flex-col items-center justify-center gap-[3px] rounded-[28px] px-1 transition-colors';

function navToneClass(active: boolean) {
  return active ? 'text-[var(--portal-primary)]' : 'text-[var(--portal-text-muted)]';
}

export function PortalBottomNav({
  pathname,
  role,
}: {
  pathname: string;
  role: PortalUiRole;
}) {
  const { open: moreOpen, setOpen: setMoreOpen, ref: moreRef } = usePopup();
  const navItems = getPortalNavigation(role).flatMap((group) => group.items);
  const hasOverflow = navItems.length > MAX_BOTTOM_NAV_SLOTS;
  const primaryItems = hasOverflow ? navItems.slice(0, MAX_BOTTOM_NAV_SLOTS - 1) : navItems;
  const overflowItems = hasOverflow ? navItems.slice(MAX_BOTTOM_NAV_SLOTS - 1) : [];
  const overflowActive = overflowItems.some((item) => isPortalRouteActive(pathname, item));

  return (
    <>
      {/* Mobile: floating pill nav like native app */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(215,235,255,0.9), rgba(243,248,255,0))' }}
      >
        <div className="flex items-center gap-4 px-4 pb-6 pt-9 pointer-events-auto w-full mx-auto">
          <nav
            aria-label="Mobile portal navigation"
            className="flex min-h-[62px] min-w-0 flex-1 items-center gap-1 rounded-[30px] bg-white p-[3px] shadow-[0_10px_18px_rgba(22,137,245,0.08)]"
          >
            {primaryItems.map((item) => {
              const active = isPortalRouteActive(pathname, item);
              const Icon = getPortalNavigationIcon(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`${navSlotClass} flex-1 ${active ? 'bg-[var(--portal-surface-soft)]' : ''}`}
                >
                  <span className={navToneClass(active)}>
                    <Icon fontSize="small" />
                  </span>
                  <span className={`max-w-full text-center text-xs font-bold leading-4 ${navToneClass(active)}`}>{item.label}</span>
                </Link>
              );
            })}
            {hasOverflow && (
              <div ref={moreRef} className="relative min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setMoreOpen((open) => !open)}
                  aria-expanded={moreOpen}
                  aria-current={overflowActive ? 'page' : undefined}
                  className={`${navSlotClass} ${overflowActive ? 'bg-[var(--portal-surface-soft)]' : ''}`}
                >
                  <span className={navToneClass(overflowActive)}>
                    <MoreHorizIcon fontSize="small" aria-hidden="true" />
                  </span>
                  <span className={`text-center text-xs font-bold leading-4 ${navToneClass(overflowActive)}`}>More</span>
                </button>
                {moreOpen && (
                  <div className="absolute bottom-full right-0 mb-3 w-56 rounded-2xl border border-[var(--portal-border-soft)] bg-white p-1 shadow-[0_16px_40px_rgba(12,43,73,0.14)]">
                    {overflowItems.map((item) => {
                      const active = isPortalRouteActive(pathname, item);
                      const Icon = getPortalNavigationIcon(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setMoreOpen(false)}
                          className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold ${navToneClass(active)} ${active ? 'bg-[var(--portal-surface-soft)]' : ''}`}
                        >
                          <Icon fontSize="small" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
