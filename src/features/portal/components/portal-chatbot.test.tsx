// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PortalChatbot from '@/features/portal/components/portal-chatbot';
import {
  clearStoredChatMessages,
  getStoredChatMessages,
  saveStoredChatMessages,
} from '@/features/portal/lib/document-chat';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) =>
    createElement('a', { href, ...props }, children),
}));

describe('PortalChatbot component', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it('renders bottom-anchored Ask Document button', () => {
    render(createElement(PortalChatbot, { documentId: 'doc-test-1' }));
    const button = screen.getByRole('button', { name: 'Open document assistant' });
    expect(button).toBeTruthy();
    expect(button.className).toContain('bottom-6');
    expect(button.className).toContain('right-6');
    expect(screen.getByText('Ask Document')).toBeTruthy();
  });

  it('opens larger dialog, displays greeting message starting with Hello, and active indication', () => {
    render(createElement(PortalChatbot, { documentId: 'doc-test-1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open document assistant' }));

    const dialog = screen.getByRole('dialog', { name: 'Ask about this document' });
    expect(dialog).toBeTruthy();
    // Verify enlarged dimensions and bottom anchoring
    expect(dialog.className).toContain('bottom-6');
    expect(dialog.className).toContain('sm:w-[460px]');
    expect(dialog.className).toContain('h-[580px]');

    // Verify initial "Hello" greeting
    expect(screen.getByText(/Hello!/i)).toBeTruthy();

    // Verify active assistant status indication
    expect(screen.getByText(/Document Assistant • Active/i)).toBeTruthy();

    // Verify full screen link with href
    const fullScreenLink = screen.getByRole('link', { name: 'Open full-page assistant' });
    expect(fullScreenLink.getAttribute('href')).toBe('/portal/documents/doc-test-1/ask');
  });

  it('persists conversation history in sessionStorage for full-screen view continuation', () => {
    const documentId = 'doc-continue-123';
    saveStoredChatMessages(documentId, [
      {
        id: 'msg-1',
        from: 'user',
        text: 'What are the main risks?',
        timestamp: '10:00 AM',
      },
      {
        id: 'msg-2',
        from: 'bot',
        text: 'Identified risk: unlimited liability clause.',
        timestamp: '10:01 AM',
      },
    ]);

    render(createElement(PortalChatbot, { documentId }));
    fireEvent.click(screen.getByRole('button', { name: 'Open document assistant' }));

    expect(screen.getByText('What are the main risks?')).toBeTruthy();
    expect(screen.getByText('Identified risk: unlimited liability clause.')).toBeTruthy();

    const stored = getStoredChatMessages(documentId);
    expect(stored.length).toBe(2);
    expect(stored[0].text).toBe('What are the main risks?');
  });

  it('clears stored messages when clear is called', () => {
    const documentId = 'doc-clear-123';
    saveStoredChatMessages(documentId, [
      {
        id: 'msg-1',
        from: 'user',
        text: 'Hello',
        timestamp: '10:00 AM',
      },
    ]);

    clearStoredChatMessages(documentId);
    const stored = getStoredChatMessages(documentId);
    expect(stored[0].id).toBe('welcome-message');
  });
});
