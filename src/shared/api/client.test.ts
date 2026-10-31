import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();

beforeEach(() => {
  vi.resetModules();
  replace.mockReset();
  vi.stubGlobal('window', { location: { replace } });
});
afterEach(() => vi.unstubAllGlobals());

describe('portalRequest', () => {
  it('shares logout and login navigation across overlapping unauthorized requests', async () => {
    let finishLogout!: (response: Response) => void;
    const logout = new Promise<Response>((resolve) => { finishLogout = resolve; });
    const fetchMock = vi.fn().mockImplementation((url: string) => url === '/api/portal/logout'
      ? logout
      : Promise.resolve(Response.json({ message: 'Session rejected', details: { reason: 'EXPIRED' } }, { status: 401 })));
    vi.stubGlobal('fetch', fetchMock);
    const { portalRequest } = await import('./client');
    const requests = Promise.allSettled([portalRequest('/first'), portalRequest('/second')]);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/portal/logout', { method: 'POST', credentials: 'same-origin' }));
    expect(replace).not.toHaveBeenCalled();
    finishLogout(new Response(null, { status: 204 }));
    const outcomes = await requests;
    for (const outcome of outcomes) {
      expect(outcome).toMatchObject({ status: 'rejected', reason: { name: 'PortalApiError', status: 401, message: 'Session rejected', details: { reason: 'EXPIRED' } } });
    }
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/portal/logout')).toHaveLength(1);
    expect(replace).toHaveBeenCalledExactlyOnceWith('/login');
  });

  it.each(['network', 'http'])('navigates once after %s logout failure without retrying cleanup', async (failure) => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/portal/logout') return failure === 'network' ? Promise.reject(new Error('Offline')) : Promise.resolve(new Response(null, { status: 500 }));
      return Promise.resolve(new Response(null, { status: 401 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    const { portalRequest } = await import('./client');
    await expect(portalRequest('/first')).rejects.toMatchObject({ status: 401 });
    await expect(portalRequest('/later')).rejects.toMatchObject({ status: 401 });
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/portal/logout')).toHaveLength(1);
    expect(replace).toHaveBeenCalledExactlyOnceWith('/login');
  });

  it.each([403, 404])('preserves %i errors without ending the session', async (status) => {
    const response = Response.json({ detail: 'Document unavailable', details: { reason: 'DENIED' } }, { status });
    const readBody = vi.spyOn(response, 'json');
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);
    const { portalRequest } = await import('./client');
    await expect(portalRequest('/document')).rejects.toMatchObject({ name: 'PortalApiError', status, message: 'Document unavailable', details: { reason: 'DENIED' } });
    expect(readBody).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  it.each(['', '<html>Server failure</html>'])('uses the status when the error body is not JSON: %j', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 502 })));
    const { portalRequest } = await import('./client');
    await expect(portalRequest('/document')).rejects.toMatchObject({ status: 502, message: 'API error: 502' });
  });

  it('preserves request options and leaves successful response bodies unread', async () => {
    const response = Response.json({ document_id: 'doc-1' });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);
    const { portalRequest } = await import('./client');
    const init = { method: 'PATCH', body: 'payload', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' as const };
    expect(await portalRequest('/document', init)).toBe(response);
    expect(response.bodyUsed).toBe(false);
    expect(await response.json()).toEqual({ document_id: 'doc-1' });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/document', { ...init, credentials: 'same-origin' });
  });

  it('returns no-content responses without parsing JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    const { portalRequest } = await import('./client');
    expect((await portalRequest('/document')).status).toBe(204);
  });

  it('keeps portalFetch proxy encoding and JSON behavior', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ document_id: 'doc-1' }));
    vi.stubGlobal('fetch', fetchMock);
    const { portalFetch } = await import('./client');
    expect(await portalFetch('/documents/a b')).toEqual({ document_id: 'doc-1' });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/portal/proxy?path=%2Fdocuments%2Fa%20b', { credentials: 'same-origin', cache: 'no-store' });
  });
});
