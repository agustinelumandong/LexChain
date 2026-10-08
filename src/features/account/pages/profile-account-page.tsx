'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { ApiSchema } from '@/shared/types/index';
import { getPortalUiRole } from '@/features/access';

type UserProfile = ApiSchema<'UserProfileResponse'>;
type GoogleConnectionStatus = ApiSchema<'GoogleConnectionStatus'>;
type GoogleCallbackOutcome = 'connected' | 'cancelled' | 'failed';

async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch('/api/portal/proxy?path=%2Fusers%2F', { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

async function fetchGoogleConnection(): Promise<GoogleConnectionStatus> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent('/google/connection')}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Unable to check Google connection.');
  const body: unknown = await response.json().catch(() => null);
  if (typeof body !== 'object' || body === null || !('connected' in body) || typeof body.connected !== 'boolean') {
    throw new Error('The backend returned an invalid Google connection status.');
  }

  return {
    connected: body.connected,
    google_email: 'google_email' in body && typeof body.google_email === 'string' ? body.google_email : null,
  };
}

async function startGoogleConnection(): Promise<string> {
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent('/google/connect')}`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Could not start Google connection. Try again.');
  const body: unknown = await response.json().catch(() => null);
  if (typeof body !== 'object' || body === null || !('authorization_url' in body) || typeof body.authorization_url !== 'string') {
    throw new Error('The backend returned an invalid Google authorization URL.');
  }

  try {
    const authorizationUrl = new URL(body.authorization_url);
    if (authorizationUrl.protocol === 'https:' && authorizationUrl.hostname === 'accounts.google.com') {
      return authorizationUrl.toString();
    }
  } catch {
    // Show an invalid backend response as a retryable connection error.
  }
  throw new Error('The backend returned an invalid Google authorization URL.');
}

function GoogleConnectionCard({ google, message }: { google?: string; message?: string }) {
  const connectionQuery = useQuery({
    queryKey: ['google-connection'],
    queryFn: fetchGoogleConnection,
  });
  const connectMutation = useMutation({ mutationFn: startGoogleConnection });
  const callbackOutcome: GoogleCallbackOutcome | null = google === 'connected'
    ? 'connected'
    : google === 'error'
      ? message?.toLowerCase().includes('access_denied') ? 'cancelled' : 'failed'
      : null;

  return (
    <section aria-labelledby="google-connection-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
      <h2 id="google-connection-heading" className="text-lg font-black text-[#0C2B49]">Google Drive</h2>
      <p className="mt-1 text-sm text-[#64748b]">Connect Google to create working document drafts in your Drive.</p>

      {callbackOutcome && <p role={callbackOutcome === 'failed' ? 'alert' : 'status'} className={`mt-4 rounded-xl p-3 text-sm font-bold ${callbackOutcome === 'connected' ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'}`}>
        {callbackOutcome === 'connected'
          ? connectionQuery.data?.connected
            ? 'Google connected successfully.'
            : connectionQuery.isPending
              ? 'Google returned to LexChain. Checking connection status…'
              : 'Google returned to LexChain, but the connection could not be confirmed. Please retry.'
          : callbackOutcome === 'cancelled'
            ? 'Google connection was cancelled. You can try again.'
            : 'Google connection failed. Please try again.'}
      </p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {connectionQuery.isPending ? (
          <p role="status" className="text-sm font-semibold text-[#64748b]">Checking Google connection…</p>
        ) : connectionQuery.isError ? (
          <>
            <p role="alert" className="text-sm font-semibold text-red-700">Unable to check Google connection.</p>
            <button type="button" onClick={() => void connectionQuery.refetch()} disabled={connectionQuery.isFetching} className="rounded-full border border-[#0985E7] px-4 py-2 text-sm font-bold text-[#0985E7] disabled:opacity-50">
              {connectionQuery.isFetching ? 'Checking…' : 'Retry status check'}
            </button>
          </>
        ) : connectionQuery.data?.connected ? (
          <>
            <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-800">Connected</span>
            {connectionQuery.data.google_email && <span className="text-sm font-medium text-[#475467]">{connectionQuery.data.google_email}</span>}
          </>
        ) : (
          <>
            <span className="rounded-full bg-[#EEF4FB] px-3 py-1 text-sm font-bold text-[#64748b]">Not connected</span>
            <button
              type="button"
              onClick={() => { connectMutation.reset(); connectMutation.mutate(); }}
              disabled={connectMutation.isPending}
              className="rounded-full bg-[#0985E7] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {connectMutation.isPending ? 'Starting connection…' : 'Connect Google'}
            </button>
            {connectMutation.data && <a href={connectMutation.data} rel="noreferrer" className="rounded-full border border-[#0985E7] px-4 py-2 text-sm font-bold text-[#0985E7]">Continue to Google</a>}
            {connectMutation.isError && <p role="alert" className="w-full text-sm font-semibold text-red-700">{connectMutation.error.message}</p>}
          </>
        )}
      </div>
    </section>
  );
}

export default function AccountPage({ google, message }: { google?: string; message?: string }) {
  const { data: user, isLoading, isError } = useQuery({ queryKey: ['portal-profile'], queryFn: fetchProfile });
  const isLawyer = getPortalUiRole(user?.role) === 'lawyer';

  const rows = [
    ['First Name', user?.f_name ?? '...'],
    ['Last Name', user?.l_name ?? '...'],
    ['Email', user?.email ?? '...'],
    ['Role', user?.role?.replace('_', ' ') ?? '...'],
    ['Avatar', user?.avatar ?? 'Default'],
  ];

  return (
    <div className="flex flex-col gap-5">
      <Link href="/portal/profile" className="flex w-fit items-center gap-1.5 text-sm font-bold text-[#0985E7]">
        <ArrowBackIcon sx={{ fontSize: 16 }} /> Back
      </Link>
      <div>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Account Details</h1>
        <p className="mt-1 text-sm text-[#64748b]">Profile editing is not available in the current backend contract.</p>
      </div>

      <div className="divide-y divide-[#E8F0F8] rounded-[18px] border border-[#E8F0F8] bg-white shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
        {isError ? (
          <div className="px-5 py-4">
            <p className="text-sm font-bold text-red-500">Failed to load account details.</p>
          </div>
        ) : rows.map(([label, value]) => (
          <div key={label} className="px-5 py-4">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#64748b]">{label}</span>
            {isLoading ? (
              <div className="mt-2 h-4 w-40 animate-pulse rounded bg-[#F5FAFF]" />
            ) : (
              <p className="mt-1 text-sm font-bold capitalize text-[#0C2B49]">{value}</p>
            )}
          </div>
        ))}
      </div>

      {isLawyer && <GoogleConnectionCard google={google} message={message} />}
    </div>
  );
}
