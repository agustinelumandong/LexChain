import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '@/server/api/backend';
import { isMockPortalToken, mockPortalMutate } from '@/lib/mocks/portal';
import { isMockMode } from '@/lib/mocks/mode';

async function validateSignedCopyUpload(request: NextRequest, method: 'POST' | 'PUT', path: string) {
  const target = new URL(path, 'http://lexchain.local');
  if (!/^\/documents\/[^/]+\/signed-copy\/?$/.test(target.pathname)) return null;

  if (method === 'POST' && !target.searchParams.get('book_id')?.trim()) {
    return NextResponse.json({ message: 'A register book is required' }, { status: 400 });
  }

  const form = await request.clone().formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File) || file.size === 0 || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
    return NextResponse.json({ message: 'A non-empty PDF file is required' }, { status: 400 });
  }
  const reason = form?.get('reason');
  if (method === 'PUT' && (typeof reason !== 'string' || !reason.trim())) {
    return NextResponse.json({ message: 'A replacement reason is required' }, { status: 400 });
  }
  return null;
}

async function handler(request: NextRequest, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE') {
  const token = request.cookies.get('portal_token')?.value;
  if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const path = request.nextUrl.searchParams.get('path');
  if (!path) return NextResponse.json({ message: 'Missing path' }, { status: 400 });

  if (method === 'POST' || method === 'PUT') {
    const validation = await validateSignedCopyUpload(request, method, path);
    if (validation) return validation;
  }

  if (isMockMode()) {
    if (!isMockPortalToken(token)) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    if (/^\/documents\/[^/]+\/signed-copy\/?$/.test(new URL(path, 'http://lexchain.local').pathname)) {
      return NextResponse.json({ message: 'Signed-copy operations are unavailable in demo mode' }, { status: 501 });
    }
    return mockPortalMutate(method, path, request, token);
  }

  const contentType = request.headers.get('content-type') ?? '';
  let body: BodyInit | undefined;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
  };

  if (contentType.includes('multipart/form-data')) {
    body = await request.blob();
    headers['content-type'] = contentType;
  } else {
    const text = await request.text().catch(() => '');
    if (text) {
      body = text;
      headers['content-type'] = 'application/json';
    }
  }

  const upstream = await fetch(backendUrl(path), {
    method,
    headers,
    body,
    cache: 'no-store',
  });

  if (upstream.status === 204) return new NextResponse(null, { status: 204 });

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: upstream.status });
}

export const POST = (request: NextRequest) => handler(request, 'POST');
export const PUT = (request: NextRequest) => handler(request, 'PUT');
export const PATCH = (request: NextRequest) => handler(request, 'PATCH');
export const DELETE = (request: NextRequest) => handler(request, 'DELETE');
