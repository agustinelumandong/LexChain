'use client';

import { useId, useState } from 'react';
import { PortalApiError } from '@/shared/api/portal-error';
import type { components } from '@/shared/types';
import type { DocumentParticipantPermission } from '@/features/access/participant-access';
import { documentParticipantPermissions, validateParticipantInvitation } from '@/features/access/participant-access';
import { Dropdown } from '@/shared/components/ui';
import { Modal } from '@/features/admin/components/modal';

type UserSearchResponse = components['schemas']['UserSearchResponse'];

type InviteParticipantFormProps = {
  onFindAccount?: (email: string) => Promise<UserSearchResponse | null>;
  onInvite: (invitation: { email: string; role: DocumentParticipantPermission }) => Promise<void>;
  onResend?: (email: string) => Promise<void>;
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

type InvitationFeedback = {
  summary: string;
  status?: number;
  fields: Partial<Record<'email' | 'role', string>>;
};

function invitationFeedback(reason: unknown, fallback: string): InvitationFeedback {
  const hasUsefulMessage = reason instanceof Error && Boolean(reason.message.trim()) && !(reason instanceof PortalApiError && reason.message === `API error: ${reason.status}`);
  const status = reason instanceof PortalApiError ? reason.status : undefined;
  const feedback: InvitationFeedback = { summary: hasUsefulMessage ? reason.message : fallback, status, fields: {} };
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

export function InviteParticipantForm({ onFindAccount, onInvite, onResend }: InviteParticipantFormProps) {
  const feedbackId = useId();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<DocumentParticipantPermission>('viewer');
  const [error, setError] = useState<InvitationFeedback>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookup, setLookup] = useState<AccountLookup>({ status: 'idle' });
  const [pendingAccount, setPendingAccount] = useState<UserSearchResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function handleSendInvitation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const validation = validateParticipantInvitation({ email, role });
    if (!validation.valid) {
      setLookup({ status: 'error', message: validation.message });
      return;
    }

    if (onFindAccount) {
      setLookup({ status: 'loading' });
      try {
        const account = await onFindAccount(validation.value.email);
        if (account) {
          setLookup({ status: 'found', account });
          setPendingAccount(account);
          setModalOpen(true);
          return;
        }
      } catch (reason) {
        const fallback = reason instanceof PortalApiError && reason.status === 429
          ? 'Account lookup is rate-limited. Please wait and try again.'
          : 'Unable to find an account right now. Please try again.';
        const feedback = invitationFeedback(reason, fallback);
        setLookup({ status: 'idle' });
        setError(feedback);
        return;
      }
    }

    if (validation.value.role !== 'viewer') {
      setLookup({ status: 'idle' });
      setError({
        summary: 'Only viewer can be invited by email.',
        fields: { role: 'Only viewer can be invited by email.' },
      });
      return;
    }

    setLookup({ status: 'idle' });
    setIsSubmitting(true);
    try {
      await onInvite(validation.value);
      setEmail('');
      setRole('viewer');
      setError(undefined);
    } catch (reason) {
      setError(invitationFeedback(reason, 'Unable to invite this participant.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendPending() {
    if (!onResend || !email.trim()) return;
    setIsSubmitting(true);
    try {
      await onResend(email.trim());
      setEmail('');
      setRole('viewer');
      setError(undefined);
    } catch (reason) {
      setError(invitationFeedback(reason, 'Unable to resend invitation.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmInvite() {
    if (!pendingAccount) return;
    const validation = validateParticipantInvitation({ email, role });
    if (!validation.valid) {
      setError({ summary: validation.message, fields: {} });
      setModalOpen(false);
      return;
    }

    setError(undefined);
    setIsSubmitting(true);
    try {
      await onInvite(validation.value);
      setEmail('');
      setRole('viewer');
      setLookup({ status: 'idle' });
      setPendingAccount(null);
      setModalOpen(false);
    } catch (reason) {
      setError(invitationFeedback(reason, 'Unable to invite this participant.'));
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoading = lookup.status === 'loading';

  return (
    <>
      <form onSubmit={handleSendInvitation} className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
        <h2 className="text-lg font-extrabold text-[#0C2B49]">Invite a participant</h2>
        <p className="mt-1 text-sm font-medium text-[#5B6F8A]">Grant access to this document only.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#0C2B49]">
            <span id={`${feedbackId}-email-label`}>Email</span>
            <input
              aria-labelledby={`${feedbackId}-email-label`}
              aria-invalid={Boolean(error?.fields.email)}
              aria-describedby={error?.fields.email ? `${feedbackId}-email` : undefined}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setLookup({ status: 'idle' });
                setError(undefined);
              }}
              disabled={isSubmitting || isLoading}
              type="email"
              autoComplete="email"
              placeholder="participant@example.com"
              className="rounded-xl border border-[#D6E3F1] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] disabled:opacity-60"
            />
            {error?.fields.email && <span id={`${feedbackId}-email`} className="text-[#C2410C]">{error.fields.email}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#0C2B49]">
            <span id={`${feedbackId}-role-label`}>Permission</span>
            <Dropdown
              ariaLabel="Permission"
              ariaDescribedBy={error?.fields.role ? `${feedbackId}-role` : undefined}
              invalid={Boolean(error?.fields.role)}
              fullWidth
              options={documentParticipantPermissions.map((permission) => ({
                label: permissionLabels[permission],
                value: permission,
              }))}
              value={role}
              onChange={(value) => {
                setRole(value as DocumentParticipantPermission);
                setError(undefined);
              }}
            />
            {error?.fields.role && <span id={`${feedbackId}-role`} className="text-[#C2410C]">{error.fields.role}</span>}
          </label>
          <button
            type="submit"
            disabled={isSubmitting || isLoading || !email.trim()}
            className="self-end rounded-xl bg-[#0067B3] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Finding account…' : isSubmitting ? 'Inviting…' : 'Send invitation'}
          </button>
        </div>
        {error && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p role="alert" className="text-sm font-semibold text-[#C2410C]">{error.summary}</p>
            {onResend && (error.status === 409 || /pending|already/i.test(error.summary)) && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleResendPending}
                className="rounded-full bg-[#0067B3] px-3.5 py-1 text-xs font-bold text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-50"
              >
                Resend invitation
              </button>
            )}
          </div>
        )}
        {lookup.status === 'error' && <p role="alert" className="mt-3 text-sm font-semibold text-[#C2410C]">{lookup.message}</p>}
      </form>

      <Modal open={modalOpen} onClose={() => { if (!isSubmitting) setModalOpen(false); }} title="Confirm participant account">
        {pendingAccount && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[#4B6382]">
              Please verify that this is the correct user before sending the invitation:
            </p>
            <div className="rounded-xl border border-[#D7E4F2] bg-[#F8FBFF] p-4 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-semibold text-[#4B6382]">Name:</span>
                <span className="font-bold text-[#0C2B49]">{pendingAccount.f_name} {pendingAccount.l_name}</span>
                <span className="font-semibold text-[#4B6382]">Email:</span>
                <span className="font-bold text-[#0C2B49]">{pendingAccount.email}</span>
                <span className="font-semibold text-[#4B6382]">Permission:</span>
                <span className="font-bold capitalize text-[#0067B3]">{permissionLabels[role]}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] hover:bg-[#EEF4FB] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInvite}
                disabled={isSubmitting}
                className="rounded-full bg-[#0067B3] px-5 py-2 text-sm font-black text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Confirm and send'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
