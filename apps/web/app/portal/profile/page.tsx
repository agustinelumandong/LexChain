'use client';

import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PolicyIcon from '@mui/icons-material/Policy';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';

const settingsItems = [
  { label: 'Account', description: 'Personal information and email', href: '/portal/profile/account', icon: PersonIcon },
  { label: 'Security', description: 'Password and login settings', href: '/portal/profile/security', icon: LockIcon },
  { label: 'Notifications', description: 'Manage notification preferences', href: '/portal/profile/notifications', icon: NotificationsNoneIcon },
  { label: 'Privacy Policy', description: 'How we handle your data', href: '/portal/profile/privacy', icon: PolicyIcon },
  { label: 'Help & Support', description: 'Get help or contact us', href: '/portal/profile/support', icon: HelpOutlineIcon },
];

export default function ProfilePage() {
  const handleLogout = async () => {
    await fetch('/api/portal/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[28px] font-black text-[#0C2B49]">Profile</h1>

      {/* Profile summary card */}
      <div className="bg-white rounded-[18px] border border-[#E8F0F8] shadow-[0_4px_12px_rgba(19,59,115,0.05)] p-6 flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0985E7] text-xl font-black text-white shrink-0">
          AR
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-[#0C2B49]">Atty. Reyes</h2>
          <p className="text-sm text-[#64748b]">lawyer@example.com</p>
        </div>
        <span className="rounded-full bg-[#EEF4FB] px-3.5 py-1.5 text-xs font-bold text-[#0985E7] shrink-0">
          Attorney
        </span>
      </div>

      {/* Settings list */}
      <div className="bg-white rounded-[18px] border border-[#E8F0F8] shadow-[0_4px_12px_rgba(19,59,115,0.05)] divide-y divide-[#E8F0F8]">
        {settingsItems.map((item) => (
          <Link key={item.label} href={item.href} className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#F8FBFF]">
            <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] flex items-center justify-center shrink-0">
              <item.icon sx={{ fontSize: 18, color: '#0985E7' }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-[#0C2B49] block">{item.label}</span>
              <span className="text-[11px] text-[#64748b]">{item.description}</span>
            </div>
            <ChevronRightIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-red-200 bg-white px-4 py-3.5 text-sm font-bold text-red-500 transition hover:bg-red-50"
      >
        <LogoutIcon sx={{ fontSize: 18 }} />
        Logout
      </button>
    </div>
  );
}
