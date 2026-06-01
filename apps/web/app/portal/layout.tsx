"use client";

import './portal.css';
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Toaster } from 'sonner';

const portalLinks = [
  { label: "Home", href: "/portal/dashboard", icon: <HomeIcon fontSize="small" /> },
  { label: "Documents", href: "/portal/documents", icon: <DescriptionIcon fontSize="small" /> },
  { label: "Activity", href: "/portal/notifications", icon: <HistoryIcon fontSize="small" /> },
  { label: "Profile", href: "/portal/profile", icon: <PersonIcon fontSize="small" /> },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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

  return (
    <main className="min-h-screen bg-[#F5FAFF] text-[#111827]">
      <div className="flex min-h-screen">
        {/* Sidebar — same pattern as admin */}
        <aside className={`relative sticky top-0 hidden h-screen shrink-0 flex-col gap-7 border-r border-[#E8F0F8] bg-white pb-[22px] pt-[26px] transition-all duration-300 lg:flex ${collapsed ? "w-[72px] px-3" : "w-[260px] px-[22px]"}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
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
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
            {portalLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  className={[
                    "flex min-h-11 items-center gap-3.5 rounded-xl py-2 text-[13px] font-black leading-4",
                    collapsed ? "justify-center px-2" : "pl-[22px] pr-3",
                    isActive
                      ? "bg-[#EEF4FB] text-[#111827]"
                      : "text-[#A0AAB8] transition hover:bg-[#F5FAFF] hover:text-[#111827]",
                  ].join(" ")}
                  href={link.href}
                  key={link.href}
                  title={collapsed ? link.label : undefined}
                >
                  <span className={isActive ? "text-[#0985E7]" : "text-[#A7B4C4]"}>
                    {link.icon}
                  </span>
                  {!collapsed && <span className="flex-1">{link.label}</span>}
                  {!collapsed && (
                    <span className={["h-6 w-[5px] rounded-full", isActive ? "bg-[#0985E7]" : "bg-transparent"].join(" ")} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Trust badge */}
          {!collapsed && (
            <div className="rounded-2xl bg-[#F8FBFF] p-4 border border-[#E8F0F8]">
              <div className="flex items-center gap-2 mb-2">
                <VerifiedUserIcon sx={{ fontSize: 20, color: '#0985E7' }} />
                <span className="text-xs font-black text-[#0C2B49]">Secure. Verifiable. Trustworthy.</span>
              </div>
              <p className="text-[11px] font-medium text-[#64748b] leading-4">All records are secured on-chain and tamper-proof.</p>
            </div>
          )}

          {/* Profile */}
          <div ref={profileMenuRef} className="relative border-t border-[#E8F0F8] pt-4">
            <div className={`flex min-h-[58px] items-center gap-3 rounded-2xl bg-[#F8FBFF] px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0985E7] text-sm font-black text-white">
                AR
              </div>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black leading-5 text-[#0C2B49]">Atty. Reyes</p>
                    <p className="truncate text-xs font-semibold leading-4 text-[#64748b]">Attorney</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((o) => !o)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#64748b] transition hover:bg-white hover:text-[#0C2B49]"
                  >
                    <MoreVertIcon fontSize="small" />
                  </button>
                </>
              )}
            </div>

            {profileMenuOpen && (
              <div className="absolute bottom-[74px] left-0 z-50 w-full overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-[0_16px_40px_rgba(12,43,73,0.14)]">
                <button
                  type="button"
                  onClick={() => { setProfileMenuOpen(false); router.push("/portal/profile/security"); }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-bold text-[#0C2B49] transition hover:bg-[#F5FAFF]"
                >
                  <SettingsIcon fontSize="small" className="text-[#64748b]" />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <LogoutIcon fontSize="small" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <section className="flex min-w-0 flex-1 flex-col px-6 py-6 overflow-x-hidden">
          {children}
        </section>
      </div>
      <Toaster position="top-center" richColors />
    </main>
  );
}
