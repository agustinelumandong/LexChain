// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PortalApiError } from '@/shared/api/portal-error';
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

  it('keeps missing accounts from being invited', async () => {
    const onInvite = vi.fn().mockResolvedValue(undefined);
    render(<InviteParticipantForm onFindAccount={vi.fn().mockResolvedValue(null)} onInvite={onInvite} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Find account' }));
    expect(await screen.findByText('No account found. Invitations can only be sent to existing accounts.')).toBeTruthy();
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('new@example.com');
    expect((screen.getByRole('button', { name: 'Send invitation' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }));
    expect(onInvite).not.toHaveBeenCalled();
  });

  it('sends invitations for existing accounts', async () => {
    const onInvite = vi.fn().mockResolvedValue(undefined);
    const onFindAccount = vi.fn().mockResolvedValue({ user_id: 'user-1', email: 'person@example.com', f_name: 'Sample', l_name: 'Person' });
    render(<InviteParticipantForm onFindAccount={onFindAccount} onInvite={onInvite} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Find account' }));
    await screen.findByText('Account found: Sample Person (person@example.com).');
    fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }));

    await waitFor(() => expect(onInvite).toHaveBeenCalledWith({ email: 'person@example.com', role: 'viewer' }));
  });

  it('keeps entered values and shows backend feedback when an invitation is rejected', async () => {
    const onInvite = vi.fn().mockRejectedValue(new Error('API error: 403'));
    render(<InviteParticipantForm onFindAccount={vi.fn().mockResolvedValue({ user_id: 'user-1', email: 'person@example.com', f_name: 'Sample', l_name: 'Person' })} onInvite={onInvite} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Find account' }));
    await screen.findByText('Account found: Sample Person (person@example.com).');
    fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }));

    expect((await screen.findByRole('alert')).textContent).toContain('API error: 403');
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('person@example.com');
  });

  it('explains rate limits as retryable lookup errors', async () => {
    render(<InviteParticipantForm onFindAccount={vi.fn().mockRejectedValue(new PortalApiError('API error: 429', 429, undefined))} onInvite={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Find account' }));

    expect(await screen.findByText('Account lookup is rate-limited. Please wait and try again.')).toBeTruthy();
  });
});


it.each(['search', 'invite'])('associates %s validation feedback with controls and preserves unmatched details and values', async (operation) => {
  const rejection = new PortalApiError('Please correct the invitation.', 422, { errors: [
    { field: 'email', message: 'This account cannot be invited.' },
    { field: 'role', message: 'Signer access is unavailable.' },
    { field: 'document_id', message: 'Sharing is paused.' },
    'Try again tomorrow.',
    { unexpected: 'Malformed detail remains visible' },
  ] });
  const account = { user_id: 'user-1', email: 'person@example.com', f_name: 'Sample', l_name: 'Person' };
  render(<InviteParticipantForm onFindAccount={operation === 'search' ? vi.fn().mockRejectedValue(rejection) : vi.fn().mockResolvedValue(account)} onInvite={vi.fn().mockRejectedValue(rejection)} />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
  fireEvent.change(screen.getByLabelText('Permission'), { target: { value: 'signer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Find account' }));
  if (operation === 'invite') {
    await screen.findByText('Account found: Sample Person (person@example.com).');
    fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }));
  }
  const alert = await screen.findByRole('alert');
  expect(alert.textContent).toContain('Please correct the invitation.');
  expect(alert.textContent).toContain('Sharing is paused.');
  expect(alert.textContent).toContain('Try again tomorrow.');
  expect(alert.textContent).toContain('Malformed detail remains visible');
  const email = screen.getByLabelText('Email') as HTMLInputElement;
  const permission = screen.getByLabelText('Permission') as HTMLSelectElement;
  expect(email.value).toBe('person@example.com');
  expect(permission.value).toBe('signer');
  expect(email.getAttribute('aria-invalid')).toBe('true');
  expect(permission.getAttribute('aria-invalid')).toBe('true');
  expect(document.getElementById(email.getAttribute('aria-describedby')!)?.textContent).toContain('This account cannot be invited.');
  expect(document.getElementById(permission.getAttribute('aria-describedby')!)?.textContent).toContain('Signer access is unavailable.');
});

it('prefers a useful backend rate-limit message over the lookup fallback', async () => {
  render(<InviteParticipantForm onFindAccount={vi.fn().mockRejectedValue(new PortalApiError('Wait 30 seconds before searching again.', 429, undefined))} onInvite={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Find account' }));
  expect((await screen.findByRole('alert')).textContent).toContain('Wait 30 seconds before searching again.');
});


it.each([
  { email: ['Account unavailable.'], role: 'Permission unavailable.' },
  [{ loc: ['body', 'email'], msg: 'Account unavailable.' }, { path: 'role', detail: 'Permission unavailable.' }],
])('maps supported backend field-error representations to existing controls', async (errors) => {
  render(<InviteParticipantForm onFindAccount={vi.fn().mockRejectedValue(new PortalApiError('Correct these fields.', 422, { errors }))} onInvite={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Find account' }));
  await screen.findByRole('alert');
  const email = screen.getByLabelText('Email');
  const permission = screen.getByLabelText('Permission');
  expect(document.getElementById(email.getAttribute('aria-describedby')!)?.textContent).toContain('Account unavailable.');
  expect(document.getElementById(permission.getAttribute('aria-describedby')!)?.textContent).toContain('Permission unavailable.');
});
