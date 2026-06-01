import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '@/lib/admin-api';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('portal_token')?.value;
  if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const path = request.nextUrl.searchParams.get('path');
  if (!path) return NextResponse.json({ message: 'Missing path' }, { status: 400 });

  const body = await request.text().catch(() => '');

  const upstream = await fetch(backendUrl(path), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: body || undefined,
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: upstream.status });
}
