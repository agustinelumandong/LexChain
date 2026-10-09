import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '@/server/api/backend';
import { isMockPortalToken, mockPortalGet, mockPortalMutate } from '@/lib/mocks/portal';
import { isMockMode } from '@/lib/mocks/mode';
import { getPortalUiRole } from "@/features/access";

type RouteContext = { params: Promise<{ id: string; partyUserId: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  const token = request.cookies.get('portal_token')?.value;
  if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const mockMode = isMockMode();
  if (mockMode && !isMockPortalToken(token)) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

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
  if (getPortalUiRole(profileData?.role) !== 'lawyer') {
    return NextResponse.json(
      { message: 'Participant management is available to Lawyers only.' },
      { status: 403 },
    );
  }

  const { id, partyUserId } = await context.params;
  if (mockMode) {
    return mockPortalMutate('DELETE', `/documents/${id}/parties/${partyUserId}`, request, token);
  }

  const upstream = await fetch(backendUrl(`/documents/${id}/parties/${partyUserId}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}
