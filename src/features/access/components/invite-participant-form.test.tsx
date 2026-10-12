// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InviteParticipantForm } from '@/features/access/components/invite-participant-form';

afterEach(() => cleanup());

describe('InviteParticipantForm account lookup', () => {
  it('looks up an account only when requested and shows the matching user', async () => {
    const onFindAccount = vi.fn().mockResolvedValue({
      user_id: 'user-1',
      email: 'person@example.com',
      f_name: 'Sample',
      l_name: 'Person',
    });
    render(<InviteParticipantForm onFindAccount={onFindAccount} onInvite={vi.fn().mockResolvedValue(undefined)} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    expect(onFindAccount).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Find account' }));

    expect(await screen.findByText('Account found: Sample Person (person@example.com).')).toBeTruthy();
    expect(onFindAccount).toHaveBeenCalledWith('person@example.com');
  });

  it('allows an invitation after the account was not found', async () => {
    const onInvite = vi.fn().mockResolvedValue(undefined);
    render(<InviteParticipantForm onFindAccount={vi.fn().mockResolvedValue(null)} onInvite={onInvite} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Find account' }));
    expect(await screen.findByText('No account found for this email. You can still send the invitation.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }));
    await waitFor(() => expect(onInvite).toHaveBeenCalledWith({ email: 'new@example.com', role: 'viewer' }));
  });

  it('explains rate limits as retryable lookup errors', async () => {
    render(<InviteParticipantForm onFindAccount={vi.fn().mockRejectedValue(new Error('API error: 429'))} onInvite={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Find account' }));

    expect(await screen.findByText('Account lookup is rate-limited. Please wait and try again.')).toBeTruthy();
  });
});
