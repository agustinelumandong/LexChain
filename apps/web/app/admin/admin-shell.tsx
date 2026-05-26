"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import MailIcon from "@mui/icons-material/Mail";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const adminLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <DashboardIcon fontSize="small" /> },
  { label: "Users", href: "/admin/users", icon: <PeopleIcon fontSize="small" /> },
  { label: "Invitations & Permissions", href: "/admin/invitations-permissions", icon: <MailIcon fontSize="small" /> },
];

type AdminShellProps = {
  activeHref?: string;
  children: React.ReactNode;
};

export function AdminShell({ activeHref = "/admin/dashboard", children }: AdminShellProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#F5FAFF] text-[#111827]">
      <div className="flex min-h-screen">
        <aside className={`relative sticky top-0 hidden h-screen shrink-0 flex-col gap-7 border-r border-[#E8F0F8] bg-white pb-[22px] pt-[26px] transition-all duration-300 lg:flex ${collapsed ? "w-[72px] px-3" : "w-[292px] px-[22px]"}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-7 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[#E8F0F8] bg-white text-[#64748b] shadow-sm transition hover:bg-[#EEF4FB] hover:text-[#0C2B49]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <MenuIcon style={{ fontSize: 14 }} /> : <ChevronLeftIcon style={{ fontSize: 14 }} />}
          </button>

          <div className="flex min-h-[52px] items-center">
            <Link className="flex items-center gap-0" href="/admin/dashboard">
              <Image src="/lexchain/logo-lexchain.svg" alt="LexChain" width={44} height={44} className="rounded-[14px]" />
              {!collapsed && (
                <div>
                  <p className="text-[25px] font-black leading-8">Lex<span className="text-[#0985E7]">Chain</span></p>
                  <p className="text-[11px] font-black uppercase leading-4 text-[#9AA8B8]">Super Admin</p>
                </div>
              )}
            </Link>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
            {adminLinks.map((link) => {
              const isActive = link.href === activeHref;
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

          <button
            onClick={handleLogout}
            className={`group flex min-h-11 cursor-pointer items-center gap-3.5 rounded-xl py-2 text-[13px] font-black leading-4 text-[#A0AAB8] transition hover:bg-red-50 hover:text-red-600 ${collapsed ? "justify-center px-2" : "pl-[22px] pr-3"}`}
            title={collapsed ? "Logout" : undefined}
          >
            <span className="text-[#A7B4C4] transition group-hover:text-red-600"><LogoutIcon fontSize="small" /></span>
            {!collapsed && <span className="flex-1">Logout</span>}
          </button>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col px-5 py-6 sm:px-7">
          {children}
        </section>
      </div>
    </main>
  );
}
