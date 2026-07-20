"use client";

import './portal.css';
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Toaster } from 'sonner';
import type { ApiSchema } from "@lexchain/types";
import { getPortalRoleLabel, getPortalUiRole, isSupportedPortalUiRole } from "./lib/portal-role";
import { getPortalNavigation } from "./lib/portal-dashboard";
import { getPortalNavigationIcon, isPortalRouteActive } from "./components/portal-role-navigation";
import { PortalBottomNav } from "./components/portal-bottom-nav";
import { PortalTopBar } from "./components/portal-topbar";

type UserProfile = ApiSchema<'UserProfileResponse'>;
type PortalDocument = { status?: string | null };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { data: profile, isError, isPending } = useQuery<UserProfile | null>({
    queryKey: ['portal-profile'],
    queryFn: async () => {
      const res = await fetch('/api/portal/proxy?path=%2Fusers%2F', { credentials: 'same-origin' });
      return res.ok ? res.json() : null;
    },
  });
  const { data: documents = [] } = useQuery<PortalDocument[]>({
    queryKey: ['portal-shell-documents'],
    queryFn: async () => {
      const res = await fetch('/api/portal/proxy?path=%2Fdocuments%2F', { credentials: 'same-origin' });
      return res.ok ? res.json() : [];
    },
    enabled: Boolean(profile),
  });

  const uiRole = getPortalUiRole(profile?.role);
  const roleLabel = getPortalRoleLabel(profile?.role);
  const portalNavigationGroups = isSupportedPortalUiRole(uiRole) ? getPortalNavigation(uiRole) : [];
  const initials = `${profile?.f_name?.[0] ?? ''}${profile?.l_name?.[0] ?? ''}`.toUpperCase() || '?';
  const fullName = profile ? `${profile.f_name} ${profile.l_name}` : '...';
  const email = profile?.email ?? '...';
  const processingCount = documents.filter((document) => {
    const status = document.status?.trim().toLowerCase();
    return status === "processing" || status === "pending";
  }).length;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/portal/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] p-6 text-[#0C2B49]">
        <p className="text-sm font-semibold">Loading your portal…</p>
      </main>
    );
  }

  if (isError || !profile || !isSupportedPortalUiRole(uiRole)) {
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
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-7 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[#E8F0F8] bg-white text-[#64748b] shadow-sm transition hover:bg-[#EEF4FB] hover:text-[#0C2B49]"
          >
            {collapsed ? <MenuIcon style={{ fontSize: 14 }} /> : <ChevronLeftIcon style={{ fontSize: 14 }} />}
          </button>

          {/* Logo */}
          <div className="flex min-h-[52px] items-center">
            <Link className="flex items-center gap-0" href="/portal/dashboard">
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
                    const isUpload = link.href === "/portal/upload";
                    const Icon = getPortalNavigationIcon(link);
                    return (
                      <Link
                        className={[
                          "flex min-h-11 items-center gap-3.5 rounded-xl py-2 text-[13px] font-black leading-4",
                          collapsed ? "justify-center px-2" : "pl-[22px] pr-3",
                          isUpload
                            ? "bg-[#0985E7] text-white transition hover:bg-[#0770c4]"
                            : isActive
                              ? "bg-[#EEF4FB] text-[#111827]"
                              : "text-[#A0AAB8] transition hover:bg-[#F5FAFF] hover:text-[#111827]",
                        ].join(" ")}
                        href={link.href}
                        key={link.href}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={link.label}
                        title={collapsed ? link.label : undefined}
                      >
                        <span className={isUpload ? "text-white" : isActive ? "text-[#0985E7]" : "text-[#A7B4C4]"}>
                          <Icon fontSize="small" />
                        </span>
                        {!collapsed && <span className="flex-1">{link.label}</span>}
                        {!collapsed && !isUpload && (
                          <span className={["h-6 w-[5px] rounded-full", isActive ? "bg-[#0985E7]" : "bg-transparent"].join(" ")} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>

          {/* Profile */}
          <div ref={profileMenuRef} className="relative border-t border-[#E8F0F8] pt-4">
            <div className={`flex min-h-[58px] items-center gap-3 rounded-2xl bg-[#F8FBFF] px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0985E7] text-sm font-black text-white">
                {initials}
              </div>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black leading-5 text-[#0C2B49]">{fullName}</p>
                    <p className="truncate text-xs font-semibold leading-4 text-[#64748b]">{roleLabel}</p>
                    <p className="truncate text-xs font-semibold leading-4 text-[#64748b]">{email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((o) => !o)}
                    aria-label="Open profile menu"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#64748b] transition hover:bg-white hover:text-[#0C2B49]"
                  >
                    <MoreVertIcon fontSize="small" />
                  </button>
                </>
              )}
            </div>

            {profileMenuOpen && (
              <div className="absolute bottom-[74px] left-0 z-50 w-full overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-[0_16px_40px_rgba(12,43,73,0.14)]">
                <Link
                  href="/portal/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-bold text-[#0C2B49] transition hover:bg-[#F5FAFF]"
                >
                  <SettingsIcon fontSize="small" className="text-[#64748b]" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <LogoutIcon fontSize="small" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <section id="portal-content" tabIndex={-1} className="flex min-w-0 flex-1 flex-col overflow-x-hidden px-6 pb-24 pt-0 md:pb-6">
          <PortalTopBar
            fullName={fullName}
            initials={initials}
            roleLabel={roleLabel}
            processingCount={processingCount}
          />
          {children}
        </section>
      </div>
      {uiRole === "issuer" ? <PortalBottomNav pathname={pathname} /> : null}
      <Toaster position="top-center" richColors />
    </main>
  );
}
