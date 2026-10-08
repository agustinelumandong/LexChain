// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import DocumentDetailPage from '@/features/documents/pages/documents-id-page';

vi.mock('@/features/portal/components', () => ({ PortalChatbot: () => null }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('shows the backend reason when ready-for-signature is blocked and preserves draft comments', async () => {
  const comment = {
    id: 'comment-1', author_name: 'Client', content: 'Please clarify this term.',
    resolved: false, created_at: '2026-10-08T11:00:00Z',
  };
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(input.toString(), 'http://localhost');
    const path = url.searchParams.get('path');
    if (path === '/documents/doc-101') return Response.json({
      document_id: 'doc-101', file_name: 'draft.docx', status: 'PREPARING', lifecycle: 'PREPARING',
      draft_url: 'https://docs.example/draft', storage_url: null, content_type: null,
      permissions: { can_mark_ready: true, can_reopen: false },
    });
    if (path === '/users/') return Response.json({ role: 'lawyer' });
    if (path === '/documents/doc-101/comments') return Response.json({ document_id: 'doc-101', unresolved: 1, comments: [comment] });
    if (path === '/documents/doc-101/versions') return Response.json({ total_version: 0, versions: [] });
    if (path === '/documents/doc-101/ready') return Response.json({ detail: 'UNRESOLVED_COMMENTS: resolve all draft threads' }, { status: 409 });
    return Response.json({});
  });
  vi.stubGlobal('fetch', fetchMock);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const params = Promise.resolve({ id: 'doc-101' }) as Promise<{ id: string }> & { status: string; value: { id: string } };
  Object.defineProperties(params, {
    status: { value: 'fulfilled' },
    value: { value: { id: 'doc-101' } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Loading</p>}>
        <DocumentDetailPage params={params} />
      </Suspense>
    </QueryClientProvider>,
  );
  fireEvent.click(await screen.findByRole('tab', { name: 'Comments' }));
  expect(await screen.findByText(comment.content)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Mark ready for signature' }));

  expect((await screen.findByRole('alert')).textContent).toContain('UNRESOLVED_COMMENTS: resolve all draft threads');
  expect(screen.getByText(comment.content)).toBeTruthy();
});
