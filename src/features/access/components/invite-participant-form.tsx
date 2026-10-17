'use client';

import { useId, useState } from 'react';
import { PortalApiError } from '@/shared/api/portal-error';
import type { components } from '@/shared/types';
import type { DocumentParticipantPermission } from '@/features/access/participant-access';
import { documentParticipantPermissions, validateParticipantInvitation } from '@/features/access/participant-access';

type UserSearchResponse = components['schemas']['UserSearchResponse'];

type InviteParticipantFormProps = {
  onFindAccount: (email: string) => Promise<UserSearchResponse | null>;
  onInvite: (invitation: { email: string; role: DocumentParticipantPermission }) => Promise<void>;
};

type AccountLookup =
  | { status: 'idle' | 'loading' | 'not-found' }
  | { status: 'found'; account: UserSearchResponse }
  | { status: 'error'; message: string };

const permissionLabels: Record<DocumentParticipantPermission, string> = {
  viewer: 'Viewer',
  signer: 'Signer',
  editor: 'Editor',
};

type InvitationFeedback = { summary: string; fields: Partial<Record<'email' | 'role', string>> };

function invitationFeedback(reason: unknown, fallback: string): InvitationFeedback {
  const hasUsefulMessage = reason instanceof Error && Boolean(reason.message.trim()) && !(reason instanceof PortalApiError && reason.message === `API error: ${reason.status}`);
  const feedback: InvitationFeedback = { summary: hasUsefulMessage ? reason.message : fallback, fields: {} };
  const details = reason instanceof PortalApiError ? reason.details : undefined;
  if (typeof details !== 'object' || details === null || !('errors' in details)) return feedback;
  const errors = details.errors;
  const entries: unknown[] = Array.isArray(errors) ? errors
    : typeof errors === 'object' && errors !== null
      ? Object.entries(errors).flatMap(([field, messages]) => (Array.isArray(messages) ? messages : [messages]).map((message) => ({ field, message })))
      : errors === undefined ? [] : [errors];
  for (const entry of entries) {
    const record = typeof entry === 'object' && entry !== null ? entry : {};
    const location: unknown = 'loc' in record && Array.isArray(record.loc) ? record.loc.at(-1) : undefined;
    const field = 'field' in record ? record.field : 'path' in record ? record.path : location;
    const message = ['message' in record ? record.message : undefined, 'msg' in record ? record.msg : undefined, 'detail' in record ? record.detail : undefined].find((value): value is string => typeof value === 'string' && Boolean(value.trim()));
    if ((field === 'email' || field === 'role') && message) {
      feedback.fields[field] = [feedback.fields[field], message].filter(Boolean).join(' ');
    } else {
      feedback.summary += ` ${message ?? (typeof entry === 'string' ? entry : JSON.stringify(entry))}`;
    }
  }
  return feedback;
}

export function InviteParticipantForm({ onFindAccount, onInvite }: InviteParticipantFormProps) {
  const feedbackId = useId();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<DocumentParticipantPermission>('viewer');
  const [error, setError] = useState<InvitationFeedback>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookup, setLookup] = useState<AccountLookup>({ status: 'idle' });

  async function findAccount() {
    setError(undefined);
    const validation = validateParticipantInvitation({ email, role });
    if (!validation.valid) {
      setLookup({ status: 'error', message: validation.message });
      return;
    }

    setLookup({ status: 'loading' });
    try {
      const account = await onFindAccount(validation.value.email);
      setLookup(account ? { status: 'found', account } : { status: 'not-found' });
    } catch (reason) {
      const fallback = reason instanceof PortalApiError && reason.status === 429
        ? 'Account lookup is rate-limited. Please wait and try again.'
        : 'Unable to find an account right now. Please try again.';
      const feedback = invitationFeedback(reason, fallback);
      setLookup({ status: 'idle' });
      setError(feedback);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lookup.status !== 'found') {
      setError({ summary: 'Find an existing account before sending an invitation.', fields: {} });
      return;
    }

    const validation = validateParticipantInvitation({ email, role });
    if (!validation.valid) {
      setError({ summary: validation.message, fields: {} });
      return;
    }

    setError(undefined);
    setIsSubmitting(true);
    try {
      await onInvite(validation.value);
      setEmail('');
      setRole('viewer');
      setLookup({ status: 'idle' });
    } catch (reason) {
      setError(invitationFeedback(reason, 'Unable to invite this participant.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
      <h2 className="text-lg font-extrabold text-[#0C2B49]">Invite a participant</h2>
      <p className="mt-1 text-sm font-medium text-[#64748b]">Grant access to this document only.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_auto_auto]">
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[#0C2B49]">
          <span id={`${feedbackId}-email-label`}>Email</span>
          <input aria-labelledby={`${feedbackId}-email-label`} aria-invalid={Boolean(error?.fields.email)} aria-describedby={error?.fields.email ? `${feedbackId}-email` : undefined} value={email} onChange={(event) => { setEmail(event.target.value); setLookup({ status: 'idle' }); setError(undefined); }} disabled={isSubmitting || lookup.status === 'loading'} type="email" autoComplete="email" placeholder="participant@example.com" className="rounded-xl border border-[#D6E3F1] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0985E7] disabled:opacity-60" />
          {error?.fields.email && <span id={`${feedbackId}-email`} className="text-[#C2410C]">{error.fields.email}</span>}
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[#0C2B49]">
          <span id={`${feedbackId}-role-label`}>Permission</span>
          <select aria-labelledby={`${feedbackId}-role-label`} aria-invalid={Boolean(error?.fields.role)} aria-describedby={error?.fields.role ? `${feedbackId}-role` : undefined} value={role} onChange={(event) => { setRole(event.target.value as DocumentParticipantPermission); setError(undefined); }} className="rounded-xl border border-[#D6E3F1] bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0985E7]">
            {documentParticipantPermissions.map((permission) => <option key={permission} value={permission}>{permissionLabels[permission]}</option>)}
          </select>
          {error?.fields.role && <span id={`${feedbackId}-role`} className="text-[#C2410C]">{error.fields.role}</span>}
        </label>
        <button type="button" onClick={findAccount} disabled={isSubmitting || lookup.status === 'loading'} className="self-end rounded-xl border border-[#D6E3F1] px-4 py-2.5 text-sm font-extrabold text-[#0C2B49] disabled:cursor-not-allowed disabled:opacity-60">{lookup.status === 'loading' ? 'Searching…' : 'Find account'}</button>
        <button type="submit" disabled={isSubmitting || lookup.status !== 'found'} className="self-end rounded-xl bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Inviting…' : 'Send invitation'}</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-[#C2410C]">{error.summary}</p>}
      {lookup.status === 'found' && <p role="status" className="mt-3 text-sm font-semibold text-[#166534]">Account found: {lookup.account.f_name} {lookup.account.l_name} ({lookup.account.email}).</p>}
      {lookup.status === 'not-found' && <p role="status" className="mt-3 text-sm font-semibold text-[#64748b]">No account found. Invitations can only be sent to existing accounts.</p>}
      {lookup.status === 'error' && <p role="alert" className="mt-3 text-sm font-semibold text-[#C2410C]">{lookup.message}</p>}
    </form>
  );
}
