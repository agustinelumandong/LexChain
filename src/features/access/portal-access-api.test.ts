import { afterEach, describe, expect, it, vi } from 'vitest';
import { inviteDocumentParty, listDocumentAuditLogs, listDocumentParties, revokeDocumentParty, searchUserByEmail } from '@/features/access/portal-access-api';

afterEach(() => vi.unstubAllGlobals());

describe('searchUserByEmail', () => {
  it('uses the same-origin proxy with the OpenAPI GET path and email query', async () => {
    const response = { user_id: 'user-1', email: 'person+test@example.com', f_name: 'Sample', l_name: 'Person' };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchUserByEmail('person+test@example.com')).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/portal/proxy?path=${encodeURIComponent('/users/search?email=person%2Btest%40example.com')}`,
      { credentials: 'same-origin', cache: 'no-store' },
    );
  });

  it('treats 404 as no account while preserving retryable status errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 })).mockResolvedValueOnce(new Response(null, { status: 429 })));

    await expect(searchUserByEmail('missing@example.com')).resolves.toBeNull();
    await expect(searchUserByEmail('person@example.com')).rejects.toThrow('API error: 429');
  });
});


describe('access request failures', () => {
  it.each([
    () => listDocumentParties('doc-1'),
    () => inviteDocumentParty('doc-1', { email: 'person@example.com', role: 'viewer' }),
    () => revokeDocumentParty('doc-1', 'user-1'),
    () => listDocumentAuditLogs('doc-1'),
    () => searchUserByEmail('person@example.com'),
  ])('preserves backend feedback and status', async (request) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ message: 'Access rejected', details: { reason: 'DENIED', errors: [{ field: 'email', message: 'Account unavailable' }] } }, { status: 403 })));
    await expect(request()).rejects.toMatchObject({ name: 'PortalApiError', status: 403, message: 'Access rejected', details: { reason: 'DENIED', errors: [{ field: 'email', message: 'Account unavailable' }] } });
  });

  it('recovers an unauthorized search through logout and sign-in', async () => {
    vi.resetModules();
    const replace = vi.fn();
    vi.stubGlobal('window', { location: { replace } });
    const fetchMock = vi.fn().mockImplementation((url: string) => Promise.resolve(url === '/api/portal/logout' ? new Response(null, { status: 204 }) : Response.json({ message: 'Session rejected' }, { status: 401 })));
    vi.stubGlobal('fetch', fetchMock);
    const { searchUserByEmail } = await import('./portal-access-api');
    await expect(searchUserByEmail('person@example.com')).rejects.toMatchObject({ status: 401, message: 'Session rejected' });
    expect(fetchMock).toHaveBeenCalledWith('/api/portal/logout', { method: 'POST', credentials: 'same-origin' });
    expect(replace).toHaveBeenCalledExactlyOnceWith('/login');
  });
});
