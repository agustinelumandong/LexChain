// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ParticipantAccessTable } from '@/features/access/components/participant-access-table';

afterEach(cleanup);

const party = {
  id: 'party-1',
  user_id: 'user-1',
  email: 'client@example.com',
  f_name: 'Client',
  l_name: 'Example',
  role: 'viewer',
  status: 'accepted',
  created_at: '2026-10-16T00:00:00Z',
};

describe('ParticipantAccessTable', () => {
  it('hides revoke when the document does not grant can_revoke', () => {
    render(<ParticipantAccessTable parties={[party]} onRevoke={vi.fn()} canRevoke={false} />);

    expect(screen.queryByRole('button', { name: /^Revoke access for/ })).toBeNull();
    expect(screen.queryByText('Actions')).toBeNull();
    expect(screen.getByText('client@example.com')).toBeTruthy();
  });

  it('shows revoke when the document grants can_revoke', () => {
    render(<ParticipantAccessTable parties={[party]} onRevoke={vi.fn()} canRevoke />);

    expect(screen.getByRole('button', { name: /^Revoke access for/ })).toBeTruthy();
  });

  it('opens a focus-managed confirmation dialog and restores focus when cancelled', async () => {
    const onRevoke = vi.fn().mockResolvedValue(undefined);
    render(<ParticipantAccessTable parties={[party]} onRevoke={onRevoke} canRevoke />);

    const trigger = screen.getByRole('button', { name: /^Revoke access for/ });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Revoke access for client@example.com?' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Revoke access for client@example.com?' })).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(onRevoke).not.toHaveBeenCalled();
  });

  it('keeps the dialog open and announces a revocation failure', async () => {
    const onRevoke = vi.fn().mockRejectedValue(new Error('Unable to revoke document access.'));
    render(<ParticipantAccessTable parties={[party]} onRevoke={onRevoke} canRevoke />);

    fireEvent.click(screen.getByRole('button', { name: /^Revoke access for/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Revoke access' }));

    expect((await screen.findByRole('alert')).textContent).toBe('Unable to revoke document access.');
    expect(screen.getByRole('dialog', { name: 'Revoke access for client@example.com?' })).toBeTruthy();
    expect(onRevoke).toHaveBeenCalledWith(party);
  });

  it('renders pending email invitations with waiting badge, expiry, Resend and Remove actions', async () => {
    const emailParty = {
      id: 'party-email-1',
      user_id: null,
      email: 'newcomer@example.com',
      f_name: '',
      l_name: '',
      role: 'viewer',
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: '2026-11-03T00:00:00Z',
    };
    const onRevoke = vi.fn().mockResolvedValue(undefined);
    const onResend = vi.fn().mockResolvedValue(undefined);

    render(
      <ParticipantAccessTable
        parties={[emailParty]}
        onRevoke={onRevoke}
        onResend={onResend}
        canRevoke
      />,
    );

    expect(screen.getByText('newcomer@example.com')).toBeTruthy();
    expect(screen.getByText('Waiting for sign-up')).toBeTruthy();
    expect(screen.getByText(/expires in 7 days/i)).toBeTruthy();

    const resendBtn = screen.getByRole('button', { name: /^Resend invitation to/ });
    const removeBtn = screen.getByRole('button', { name: /^Remove invitation for/ });
    expect(resendBtn).toBeTruthy();
    expect(removeBtn).toBeTruthy();

    fireEvent.click(resendBtn);
    await waitFor(() => expect(onResend).toHaveBeenCalledWith(emailParty));

    fireEvent.click(removeBtn);
    const dialog = await screen.findByRole('dialog', { name: 'Remove invitation for newcomer@example.com?' });
    expect(dialog).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove invitation' }));
    await waitFor(() => expect(onRevoke).toHaveBeenCalledWith(emailParty));
  });

  it('renders expired email invitations with Invitation expired badge', () => {
    const expiredParty = {
      id: 'party-email-2',
      user_id: null,
      email: 'expired@example.com',
      f_name: '',
      l_name: '',
      role: 'viewer',
      status: 'expired',
      expires_at: '2026-10-20T00:00:00Z',
      created_at: '2026-10-13T00:00:00Z',
    };

    render(
      <ParticipantAccessTable
        parties={[expiredParty]}
        onRevoke={vi.fn()}
        onResend={vi.fn()}
        canRevoke
      />,
    );

    expect(screen.getByText('expired@example.com')).toBeTruthy();
    expect(screen.getByText('Invitation expired')).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Resend invitation to/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Remove invitation for/ })).toBeTruthy();
  });

  it('shows a clear empty state instead of empty table columns', () => {
    render(<ParticipantAccessTable parties={[]} onRevoke={vi.fn()} canRevoke={false} />);

    expect(screen.getByRole('heading', { name: 'Document participants' })).toBeTruthy();
    expect(screen.queryByText('Access is limited to this document.')).toBeNull();
    expect(screen.getByText('No participants have access yet.')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByText('Invite someone above to share this document.')).toBeNull();
  });

  it('keeps long emails on one line with the full address available', () => {
    const email = 'a-very-long-participant-address@some-long-law-office-domain.example.com';
    render(<ParticipantAccessTable parties={[{ ...party, email }]} onRevoke={vi.fn()} canRevoke={false} />);

    const shown = screen.getByText(email);
    expect(shown.className).toContain('truncate');
    expect(shown.getAttribute('title')).toBe(email);
  });

  it('adds decorative icons to row actions without changing their names', () => {
    const emailParty = { ...party, id: 'party-email', user_id: null, status: 'pending' };
    render(<ParticipantAccessTable parties={[emailParty]} onRevoke={vi.fn()} onResend={vi.fn()} canRevoke />);

    for (const name of [/^Resend invitation to/, /^Remove invitation for/]) {
      expect(screen.getByRole('button', { name }).querySelector('svg[aria-hidden="true"]')).toBeTruthy();
    }
  });

  it('keeps row actions quiet and reserves solid red for the confirmation', async () => {
    render(<ParticipantAccessTable parties={[party]} onRevoke={vi.fn()} canRevoke />);

    const trigger = screen.getByRole('button', { name: 'Revoke access for client@example.com' });
    expect(trigger.textContent).toBe('Revoke');
    expect(trigger.className).toContain('border-[var(--status-error-border)]');

    fireEvent.click(trigger);
    const confirm = await screen.findByRole('button', { name: 'Revoke access' });
    expect(confirm.className).toContain('bg-[var(--status-error)] text-white');
  });

  it('points to the invitation form when the viewer can invite and nobody has access', () => {
    render(<ParticipantAccessTable parties={[]} onRevoke={vi.fn()} canRevoke canInvite />);

    expect(screen.getByText('Invite someone above to share this document.')).toBeTruthy();
  });

  it('lists each participant with labeled permission and status, without a scrolling table', () => {
    const other = { ...party, id: 'party-2', email: 'second@example.com', status: 'declined' };
    render(<ParticipantAccessTable parties={[party, other]} onRevoke={vi.fn()} canRevoke={false} />);

    const list = screen.getByRole('list', { name: 'Document participants' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getAllByText('Permission')).toHaveLength(2);
    expect(screen.getAllByText('Status')).toHaveLength(2);
    expect(screen.getByText('accepted').className).toContain('emerald');
    expect(screen.getByText('declined').className).toContain('red');
  });

  it('renders populated participants with visible email, permission, and status without duplicated helper copy', () => {
    render(<ParticipantAccessTable parties={[party]} onRevoke={vi.fn()} canRevoke={false} />);

    expect(screen.getByRole('heading', { name: 'Document participants' })).toBeTruthy();
    expect(screen.queryByText('Access is limited to this document.')).toBeNull();
    expect(screen.getByText('client@example.com')).toBeTruthy();
    expect(screen.getByText('Client Example')).toBeTruthy();
    expect(screen.getByText('viewer')).toBeTruthy();
    expect(screen.getByText('accepted')).toBeTruthy();
  });
});
