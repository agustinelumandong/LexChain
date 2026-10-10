import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchUserByEmail } from '@/features/access/portal-access-api';

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
