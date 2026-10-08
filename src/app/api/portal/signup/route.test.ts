import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const signupRequest = () => new Request('https://lexchain.test/api/portal/signup', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ada@example.com', password: 'Password123', f_name: 'Ada', l_name: 'Lovelace' }),
});

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('API_URL', 'https://api.lexchain.test');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('portal signup route', () => {
  it('preserves the upstream success status and confirmation result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
      user_id: 'user-1',
      email: 'ada@example.com',
      requires_email_confirmation: true,
      message: 'Check your inbox.',
    }, { status: 201 })));
    const { POST } = await import('./route');

    const response = await POST(signupRequest());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      requires_email_confirmation: true,
      message: 'Check your inbox.',
    });
  });

  it.each([
    [400, { detail: 'Invalid signup details.' }, 'Invalid signup details.'],
    [409, { message: 'An account already exists.' }, 'An account already exists.'],
    [422, { detail: [{ msg: 'Email is invalid.' }] }, 'Email is invalid.'],
    [429, { error: 'Rate limit exceeded' }, 'Rate limit exceeded'],
    [502, {}, 'The signup service is temporarily unavailable. Try again shortly.'],
  ])('preserves %s errors and provides a useful message', async (status, payload, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(payload === null ? '' : JSON.stringify(payload), { status })));
    const { POST } = await import('./route');

    const response = await POST(signupRequest());

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ message });
  });

  it('returns a temporary-service error when the backend cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { POST } = await import('./route');

    const response = await POST(signupRequest());

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ message: 'Unable to reach the API.' });
  });
});
