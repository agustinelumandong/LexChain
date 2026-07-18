'use client';

import Link from 'next/link';
import { getPortalNavigation } from '../lib/portal-dashboard';
import { getPortalRoleLabel } from '../lib/portal-role';
import { getPortalNavigationIcon, isPortalRouteActive } from './portal-role-navigation';

export function PortalSidebar({ pathname }: { pathname: string }) {
  const navItems = getPortalNavigation('issuer');

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
        {navItems.map((item) => {
          const active = isPortalRouteActive(pathname, item);
          const Icon = getPortalNavigationIcon(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[var(--portal-surface-soft)] text-[var(--portal-primary)]' : 'text-[var(--portal-text-muted)] hover:bg-[var(--portal-surface-soft)]'}`}
            >
              <Icon fontSize="small" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--portal-border-soft)] p-4 text-xs font-semibold text-[var(--portal-text-muted)]">
        {getPortalRoleLabel('lawyer')}
      </div>
    </aside>
  );
}
