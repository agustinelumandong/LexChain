import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '@/server/api/backend';
import { isMockPortalToken, mockPortalGet, mockPortalMutate } from '@/lib/mocks/portal';
import { isMockMode } from '@/lib/mocks/mode';
import { validateParticipantInvitation, getPortalUiRole } from "@/features/access";

type RouteContext = { params: Promise<{ id: string }> };

function tokenFrom(request: NextRequest) {
  return request.cookies.get('portal_token')?.value;
}

function unauthenticated() {
  return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
}

async function isDocumentIssuer(token: string, mockMode: boolean) {
  const profile = mockMode
    ? mockPortalGet('/users/', token)
    : await fetch(backendUrl('/users/'), {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        cache: 'no-store',
      });
  const profileData = await profile.json().catch(() => null);
  return getPortalUiRole(profileData?.role) === 'lawyer';
}

async function proxy(request: NextRequest, method: 'GET' | 'POST', context: RouteContext, body?: string) {
  const token = tokenFrom(request);
  if (!token) return unauthenticated();
  const mockMode = isMockMode();
  if (mockMode && !isMockPortalToken(token)) return unauthenticated();

  if (!await isDocumentIssuer(token, mockMode)) {
    return NextResponse.json(
      { message: 'Participant management is available to Lawyers only.' },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  if (mockMode) {
    const path = `/documents/${id}/parties`;
    if (method === 'GET') return mockPortalGet(path, token);
    return mockPortalMutate(method, path, new Request(request.url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    }), token);
  }

  const upstream = await fetch(backendUrl(`/documents/${id}/parties`), {
    ...(method === 'POST' ? { method } : {}),
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body } : {}),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}

export const GET = (request: NextRequest, context: RouteContext) => proxy(request, 'GET', context);
export async function POST(request: NextRequest, context: RouteContext) {
  if (!tokenFrom(request)) return unauthenticated();

  const payload: unknown = await request.json().catch(() => null);
  const invitation = payload && typeof payload === 'object'
    ? validateParticipantInvitation({
      email: typeof (payload as { email?: unknown }).email === 'string' ? (payload as { email: string }).email : '',
      role: typeof (payload as { role?: unknown }).role === 'string' ? (payload as { role: string }).role : '',
    })
    : { valid: false as const, message: 'Enter a valid participant invitation.' };

  if (!invitation.valid) return NextResponse.json({ message: invitation.message }, { status: 400 });

  return proxy(request, 'POST', context, JSON.stringify(invitation.value));
}
