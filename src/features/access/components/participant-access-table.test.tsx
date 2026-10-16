// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
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

    expect(screen.queryByRole('button', { name: 'Revoke' })).toBeNull();
    expect(screen.queryByText('Actions')).toBeNull();
    expect(screen.getByText('client@example.com')).toBeTruthy();
  });

  it('shows revoke when the document grants can_revoke', () => {
    render(<ParticipantAccessTable parties={[party]} onRevoke={vi.fn()} canRevoke />);

    expect(screen.getByRole('button', { name: 'Revoke' })).toBeTruthy();
  });
});
