import { isIP } from 'node:net';
import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '@/server/api/backend';
import { isMockPortalToken, mockPortalGet } from '@/lib/mocks/portal';
import { isMockMode } from '@/lib/mocks/mode';

function downloadName(value: string | null, documentId: string) {
  const name = (value ?? `signed-copy-${documentId}.pdf`)
    .replace(/[\\/\u0000-\u001f\u007f"]/g, '_')
    .slice(0, 180);
  return name || 'signed-copy.pdf';
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('portal_token')?.value;
  if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const query = new URLSearchParams();
  const copyId = request.nextUrl.searchParams.get('copy_id');
  if (copyId) query.set('copy_id', copyId);
  const path = `/documents/${encodeURIComponent(id)}/file${query.size ? `?${query}` : ''}`;

  let linkResponse: Response;
  if (isMockMode()) {
    if (!isMockPortalToken(token)) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    linkResponse = mockPortalGet(path, token);
  } else {
    try {
      linkResponse = await fetch(backendUrl(path), {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        cache: 'no-store',
        redirect: 'error',
      });
    } catch {
      return NextResponse.json({ message: 'Backend request failed' }, { status: 502 });
    }
  }

  const linkData = await linkResponse.json().catch(() => null) as { url?: unknown } | null;
  if (!linkResponse.ok) return NextResponse.json(linkData, { status: linkResponse.status });
  if (!linkData || typeof linkData.url !== 'string') {
    return NextResponse.json({ message: 'Backend returned an invalid signed PDF link' }, { status: 502 });
  }

  let fileUrl: URL;
  try {
    fileUrl = isMockMode() ? new URL(linkData.url, request.nextUrl.origin) : new URL(linkData.url);
  } catch {
    return NextResponse.json({ message: 'Backend returned an invalid signed PDF link' }, { status: 502 });
  }
  const hostname = fileUrl.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const localHost = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal');
  const invalidFileUrl = Boolean(fileUrl.username || fileUrl.password) || (isMockMode()
    ? fileUrl.origin !== request.nextUrl.origin || !fileUrl.pathname.startsWith('/mock-documents/')
    : fileUrl.protocol !== 'https:' || isIP(hostname) !== 0 || localHost || !hostname.includes('.'));
  if (invalidFileUrl) {
    return NextResponse.json({ message: 'Backend returned an invalid signed PDF link' }, { status: 502 });
  }

  let fileResponse: Response;
  try {
    const headers = new Headers();
    const range = request.headers.get('range');
    if (range) headers.set('range', range);
    const cookie = request.headers.get('cookie');
    if (cookie && fileUrl.origin === request.nextUrl.origin) headers.set('cookie', cookie);
    fileResponse = await fetch(fileUrl, { headers, cache: 'no-store', redirect: 'error' });
  } catch {
    return NextResponse.json({ message: 'Unable to retrieve the signed PDF' }, { status: 502 });
  }
  if (!fileResponse.ok && fileResponse.status !== 206) {
    return NextResponse.json({ message: 'Unable to retrieve the signed PDF' }, { status: 502 });
  }

  const responseHeaders = new Headers({
    'Content-Type': fileResponse.headers.get('content-type') ?? 'application/pdf',
    'Content-Disposition': `${request.nextUrl.searchParams.get('download') === '1' ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(downloadName(request.nextUrl.searchParams.get('filename'), id))}`,
    'Cache-Control': 'private, no-store',
  });
  for (const header of ['accept-ranges', 'content-length', 'content-range']) {
    const value = fileResponse.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  return new Response(fileResponse.body, { status: fileResponse.status, headers: responseHeaders });
}
