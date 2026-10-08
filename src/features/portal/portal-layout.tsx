"use client";

import '@/features/portal/portal.css';
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Toaster } from 'sonner';
import { getPortalLoginRedirect, getPortalRoleLabel, isSupportedPortalUiRole } from "@/features/access";
import { getPortalNavigation } from "@/features/portal/portal-dashboard";
import { getPortalNavigationIcon, isPortalRouteActive, usePortalRole } from "@/features/access/components";
import { PortalBottomNav } from "@/features/portal/components/portal-bottom-nav";
import { PortalTopBar } from "@/features/portal/components/portal-topbar";
import { fetchNotifications, fetchUnreadNotificationCount, invalidateNotificationQueries, markAllNotificationsRead, notificationQueryKeys } from "@/features/portal/notifications-api";

type PortalDocument = { status?: string | null };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);
  const uiRole = usePortalRole();
  const { data: documents = [] } = useQuery<PortalDocument[]>({
    queryKey: ['portal-shell-documents'],
    queryFn: async () => {
      const res = await fetch('/api/portal/proxy?path=%2Fdocuments%2F', { credentials: 'same-origin' });
      return res.ok ? res.json() : [];
    },
    enabled: uiRole === "lawyer",
  });
  const unreadCountQuery = useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: fetchUnreadNotificationCount,
    enabled: isSupportedPortalUiRole(uiRole),
  });
  const notificationsQuery = useQuery({
    queryKey: notificationQueryKeys.shell,
    queryFn: fetchNotifications,
    enabled: isSupportedPortalUiRole(uiRole),
  });
  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => invalidateNotificationQueries(queryClient),
  });
  const roleLabel = getPortalRoleLabel(uiRole);
  const portalNavigationGroups = isSupportedPortalUiRole(uiRole)
    ? getPortalNavigation(uiRole)
    : [];
  const portalHome = getPortalLoginRedirect(uiRole) ?? "/portal/dashboard";
  const processingCount = documents.filter((document) => {
    const status = document.status?.trim().toLowerCase();
    return status === "processing" || status === "pending";
  }).length;

  async function handleLogout() {
    try {
      await fetch("/api/portal/logout", { method: "POST" });
    } catch {
      // Continue to login when the session endpoint cannot be reached.
    } finally {
      window.location.href = "/login";
    }
  }

  if (!isSupportedPortalUiRole(uiRole)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] p-6 text-[#0C2B49]">
        <section className="w-full max-w-md rounded-2xl border border-[#E4EEF9] bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-black">Portal access unavailable</h1>
          <p className="mt-2 text-sm font-semibold text-[#64748b]">Your account does not have a supported portal role.</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0770c4]"
          >
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5FAFF] text-[#111827]">
      <div className="flex min-h-screen">
        <a
          href="#portal-content"
          className="sr-only z-[60] rounded-md bg-[#0C2B49] px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:outline-none"
        >
          Skip to content
        </a>
        {/* Desktop office navigation */}
        <aside className={`relative sticky top-0 hidden h-screen shrink-0 flex-col gap-7 border-r border-[#E8F0F8] bg-white pb-[22px] pt-[26px] transition-all duration-300 md:flex ${collapsed ? "w-[72px] px-3" : "w-[260px] px-[22px]"}`}>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-7 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[#E8F0F8] bg-white text-[#64748b] shadow-sm transition hover:bg-[#EEF4FB] hover:text-[#0C2B49]"
          >
            {collapsed ? <MenuIcon style={{ fontSize: 14 }} /> : <ChevronLeftIcon style={{ fontSize: 14 }} />}
          </button>

          {/* Logo */}
          <div className="flex min-h-[52px] items-center">
            <Link className="flex items-center gap-0" href={portalHome}>
              <Image src="/lexchain/logo-lexchain.svg" alt="LexChain" width={44} height={44} className="rounded-[14px]" />
              {!collapsed && (
                <div>
                  <p className="text-[25px] font-black leading-8">Lex<span className="text-[#0985E7]">Chain</span></p>
                </div>
              )}
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {portalNavigationGroups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                {!collapsed && <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#A0AAB8]">{group.label}</p>}
                <div className="flex flex-col gap-0.5">
                  {group.items.map((link) => {
                    const isActive = isPortalRouteActive(pathname, link);
                    const Icon = getPortalNavigationIcon(link);
                    return (
                      <Link
                        className={[
                          "flex min-h-11 items-center gap-3.5 rounded-xl py-2 text-[13px] font-black leading-4",
                          collapsed ? "justify-center px-2" : "pl-[22px] pr-3",
                          isActive
                            ? "bg-[#0985E7]/15 text-[#0C2B49]"
                            : "text-[#111827] transition hover:bg-[#F5FAFF]",
                        ].join(" ")}
                        href={link.href}
                        key={link.href}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={link.label}
                        title={collapsed ? link.label : undefined}
                      >
                        <span className={isActive ? "text-[#0985E7]" : "text-[#64748b]"}>
                          <Icon fontSize="small" />
                        </span>
                        {!collapsed && <span className="flex-1">{link.label}</span>}
                        {!collapsed && (
                          <span className={["h-6 w-[5px] rounded-full", isActive ? "bg-[#0985E7]" : "bg-transparent"].join(" ")} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <section id="portal-content" tabIndex={-1} className="flex min-w-0 flex-1 flex-col overflow-x-clip px-6 pb-24 pt-0 md:pb-6">
          <PortalTopBar
            initials="?"
            roleLabel={roleLabel}
            role={uiRole}
            processingCount={processingCount}
            unreadCount={unreadCountQuery.data}
            unreadCountLoading={unreadCountQuery.isLoading}
            unreadCountError={unreadCountQuery.isError}
            notifications={notificationsQuery.data?.notifications}
            notificationsLoading={notificationsQuery.isLoading}
            notificationsError={notificationsQuery.isError ? notificationsQuery.error.message : undefined}
            markAllError={markAllMutation.isError ? markAllMutation.error.message : undefined}
            markAllPending={markAllMutation.isPending}
            onRetryNotifications={() => { void Promise.all([notificationsQuery.refetch(), unreadCountQuery.refetch()]); }}
            onMarkAllRead={() => markAllMutation.mutate()}
            onSignOut={handleLogout}
          />
          {children}
        </section>
      </div>
      {isSupportedPortalUiRole(uiRole) ? (
        <PortalBottomNav pathname={pathname} role={uiRole} />
      ) : null}
      <Toaster position="top-center" richColors />
    </main>
  );
}
