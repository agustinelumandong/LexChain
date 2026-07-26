import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '@/lib/admin-api';
import { isMockMode, isMockPortalToken, mockPortalGet } from '@/lib/portal-mock';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const token = request.cookies.get('portal_token')?.value;
  if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const { id } = await context.params;
  if (isMockMode()) {
    if (!isMockPortalToken(token)) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    return mockPortalGet(`/blockchain/verify/${id}`, token);
  }

  const upstream = await fetch(backendUrl(`/blockchain/verify/${id}`), {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}
