import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '@/lib/admin-api';

type RouteContext = { params: Promise<{ id: string }> };

function tokenFrom(request: NextRequest) {
  return request.cookies.get('portal_token')?.value;
}

function unauthenticated() {
  return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
}

async function proxy(request: NextRequest, method: 'GET' | 'POST', context: RouteContext) {
  const token = tokenFrom(request);
  if (!token) return unauthenticated();

  const { id } = await context.params;
  const body = method === 'POST' ? await request.text() : undefined;
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
export const POST = (request: NextRequest, context: RouteContext) => proxy(request, 'POST', context);
