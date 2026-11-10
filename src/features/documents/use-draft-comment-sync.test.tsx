// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { draftCommentsQueryKey, useDraftCommentSync } from './use-draft-comment-sync';

const { syncDraftCommentsMock } = vi.hoisted(() => ({ syncDraftCommentsMock: vi.fn() }));

vi.mock('@/features/documents/document-lifecycle-api', () => ({ syncDraftComments: syncDraftCommentsMock }));

const synced = { document_id: 'doc-1', unresolved: 0, comments: [] };

function renderSync(autoSync = true) {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const view = renderHook(({ enabled }) => useDraftCommentSync('doc-1', enabled), { wrapper, initialProps: { enabled: autoSync } });
  return { ...view, queryClient };
}

function setVisibility(state: DocumentVisibilityState) {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
}

async function advance(ms: number) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}

async function focusWindow() {
  await act(async () => {
    window.dispatchEvent(new Event('focus'));
    await vi.advanceTimersByTimeAsync(0);
  });
}

describe('useDraftCommentSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    syncDraftCommentsMock.mockReset();
    syncDraftCommentsMock.mockResolvedValue(synced);
    setVisibility('visible');
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('syncs every 30 seconds while the page is visible and publishes the result', async () => {
    const { queryClient } = renderSync();

    await advance(29_999);
    expect(syncDraftCommentsMock).not.toHaveBeenCalled();

    await advance(1);
    expect(syncDraftCommentsMock).toHaveBeenCalledWith('doc-1');
    expect(queryClient.getQueryData(draftCommentsQueryKey('doc-1'))).toEqual(synced);
  });

  it('syncs when the user returns to the window or tab', async () => {
    renderSync();

    await focusWindow();
    expect(syncDraftCommentsMock).toHaveBeenCalledTimes(1);

    await advance(5_000);
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(syncDraftCommentsMock).toHaveBeenCalledTimes(2);
  });

  it('does not sync again when focus returns right after a sync', async () => {
    renderSync();

    await focusWindow();
    await advance(4_999);
    await focusWindow();

    expect(syncDraftCommentsMock).toHaveBeenCalledTimes(1);
  });

  it('does not sync while the page is hidden', async () => {
    setVisibility('hidden');
    renderSync();

    await advance(60_000);
    await focusWindow();

    expect(syncDraftCommentsMock).not.toHaveBeenCalled();
  });

  it('does not sync when automatic sync is off, and stops when it turns off', async () => {
    const { rerender } = renderSync(false);
    await advance(30_000);
    await focusWindow();
    expect(syncDraftCommentsMock).not.toHaveBeenCalled();

    rerender({ enabled: true });
    await advance(30_000);
    expect(syncDraftCommentsMock).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });
    await advance(30_000);
    await focusWindow();
    expect(syncDraftCommentsMock).toHaveBeenCalledTimes(1);
  });

  it('stops syncing after unmount', async () => {
    const { unmount } = renderSync();
    unmount();

    await advance(30_000);
    await focusWindow();

    expect(syncDraftCommentsMock).not.toHaveBeenCalled();
  });

  it('shares one in-flight request between automatic and manual syncs', async () => {
    let finish: (value: typeof synced) => void = () => undefined;
    syncDraftCommentsMock.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const { result } = renderSync();

    await advance(30_000);
    await advance(30_000);
    const manual = result.current();
    expect(syncDraftCommentsMock).toHaveBeenCalledTimes(1);

    finish(synced);
    await expect(manual).resolves.toEqual(synced);
  });

  it('keeps automatic failures quiet and tries again on the next tick', async () => {
    syncDraftCommentsMock.mockRejectedValueOnce(new Error('Google Docs is unavailable'));
    const { queryClient } = renderSync();

    await advance(30_000);
    expect(queryClient.getQueryData(draftCommentsQueryKey('doc-1'))).toBeUndefined();

    await advance(30_000);
    expect(syncDraftCommentsMock).toHaveBeenCalledTimes(2);
    expect(queryClient.getQueryData(draftCommentsQueryKey('doc-1'))).toEqual(synced);
  });

  it('reports a failure to the manual caller', async () => {
    syncDraftCommentsMock.mockRejectedValueOnce(new Error('Google Docs is unavailable'));
    const { result } = renderSync(false);

    await expect(result.current()).rejects.toThrow('Google Docs is unavailable');
  });
});
