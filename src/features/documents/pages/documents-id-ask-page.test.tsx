// @vitest-environment jsdom
import { createElement, Suspense } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AskPage from '@/features/documents/pages/documents-id-ask-page';
import { saveStoredChatMessages } from '@/features/portal/lib/document-chat';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) =>
    createElement('a', { href, ...props }, children),
}));

function renderWithSuspense(element: React.ReactElement) {
  return render(
    createElement(Suspense, { fallback: createElement('div', null, 'Loading...') }, element),
  );
}

describe('AskPage full-screen chat', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it('loads previously stored chat history from popup and continues conversation', async () => {
    const documentId = 'doc-full-page-1';
    saveStoredChatMessages(documentId, [
      {
        id: 'msg-prev-1',
        from: 'user',
        text: 'Who are the signers?',
        timestamp: '11:00 AM',
      },
      {
        id: 'msg-prev-2',
        from: 'bot',
        text: 'The signers are Alice and Bob.',
        timestamp: '11:01 AM',
      },
    ]);

    await act(async () => {
      renderWithSuspense(
        createElement(AskPage, { params: Promise.resolve({ id: documentId }) }),
      );
    });

    expect(await screen.findByText('Who are the signers?')).toBeTruthy();
    expect(await screen.findByText('The signers are Alice and Bob.')).toBeTruthy();
    expect(screen.getByText(/Document Assistant • Active/i)).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Ask a question about this document' })).toBeTruthy();
  });

  it('renders initial Hello greeting when no prior history exists', async () => {
    await act(async () => {
      renderWithSuspense(
        createElement(AskPage, { params: Promise.resolve({ id: 'doc-fresh' }) }),
      );
    });

    expect(await screen.findByText(/Hello!/i)).toBeTruthy();
    expect(screen.getByText(/Suggested Questions/i)).toBeTruthy();
  });

  it('resets conversation when New chat button is clicked', async () => {
    const documentId = 'doc-reset-test';
    saveStoredChatMessages(documentId, [
      {
        id: 'msg-1',
        from: 'user',
        text: 'Existing question',
        timestamp: '11:00 AM',
      },
    ]);

    await act(async () => {
      renderWithSuspense(
        createElement(AskPage, { params: Promise.resolve({ id: documentId }) }),
      );
    });
    expect(await screen.findByText('Existing question')).toBeTruthy();

    const newChatButton = screen.getByRole('button', { name: 'Clear chat history' });
    fireEvent.click(newChatButton);

    expect(await screen.findByText(/Hello!/i)).toBeTruthy();
    expect(screen.queryByText('Existing question')).toBeNull();
  });
});
