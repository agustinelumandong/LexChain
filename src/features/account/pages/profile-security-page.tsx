'use client';

import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import PhonelinkLockIcon from '@mui/icons-material/PhonelinkLock';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PasswordIcon from '@mui/icons-material/Password';
import { useQuery } from '@tanstack/react-query';
import type { PortalUserProfile } from "@/features/access";

async function fetchProfile(): Promise<PortalUserProfile> {
  const response = await fetch('/api/portal/proxy?path=%2Fusers%2F', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Failed to load profile');
  return response.json();
}

export default function SecurityPage() {
  const { data: profile, isLoading, isError, refetch } = useQuery({ queryKey: ['portal-profile'], queryFn: fetchProfile });
  const profileUnavailable = isError && !profile;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/portal/profile" className="flex items-center gap-1.5 text-sm font-bold text-[#0985E7] w-fit">
        <ArrowBackIcon sx={{ fontSize: 16 }} /> Back
      </Link>
      <h1 className="text-[28px] font-black text-[#0C2B49]">Security</h1>

      {profileUnavailable && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"><span>Unable to load your security status.</span><button type="button" onClick={() => void refetch()} className="rounded-full border border-red-300 px-4 py-2 font-bold hover:bg-white">Retry</button></div>}

      <div className="divide-y divide-[#E8F0F8] rounded-[18px] border border-[#E8F0F8] bg-white shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
        <SecurityItem icon={VerifiedUserIcon} title="Email verification" description="Verify your email from the message sent when you register before signing in." />
        <SecurityItem
          icon={SecurityIcon}
          title="Authenticator-app MFA"
          description={profileUnavailable ? 'MFA status could not be checked.' : profile?.mfa_enabled ? 'Authenticator-app MFA is enabled for this account.' : 'Authenticator-app MFA is not enabled for this account.'}
          status={isLoading ? 'Checking' : profileUnavailable ? 'Unavailable' : profile?.mfa_enabled ? 'Enabled' : 'Not enabled'}
        />
        <SecurityItem icon={PhonelinkLockIcon} title="Device lock" description="Use your device screen lock to protect access to this browser." />
        <SecurityItem icon={NotificationsActiveIcon} title="Trusted-device alerts" description="Trusted-device alerts are not available in this browser portal yet." />
        <SecurityItem icon={PasswordIcon} title="Password changes" description="Password changes are not available in this browser portal yet." />
      </div>
    </div>
  );
}

function SecurityItem({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: typeof VerifiedUserIcon;
  title: string;
  description: string;
  status?: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF6FF]">
        <Icon sx={{ fontSize: 18, color: '#0985E7' }} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#0C2B49]">{title}</span>
        <span className="text-[11px] text-[#64748b]">{description}</span>
      </div>
      {status ? <span className="shrink-0 rounded-full bg-[#EEF4FB] px-3 py-1 text-[11px] font-bold text-[#0985E7]">{status}</span> : null}
    </div>
  );
}
