import type { components } from '@/shared/types/generated/schema';

export type DocumentChatMessage = {
  id: string;
  from: 'bot' | 'user';
  text: string;
  timestamp: string;
  includeInHistory?: boolean;
};

export const DEFAULT_SUGGESTED_QUESTIONS = [
  'What are the key dates?',
  'Who are the parties?',
  'What should I review?',
  'What are the payment terms?',
];

export const MOCK_RESPONSES = [
  'Based on the document, the contract term is 12 months with automatic renewal.',
  'The key parties involved are LexChain Corp and Acme Inc.',
  'There are 2 risk flags identified: auto-renewal without notice and unlimited liability.',
  'The monthly payment obligation is $5,000 due by the 15th of each month.',
  'Governing law is set to Singapore jurisdiction under commercial arbitration rules.',
];

export function getCurrentTimestamp(): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return 'Just now';
  }
}

export function createDefaultGreetingMessage(): DocumentChatMessage {
  return {
    id: 'welcome-message',
    from: 'bot',
    text: "Hello! 👋 I am your LexChain document assistant. Ask me anything about this document—such as key dates, parties, obligations, or potential risk items.",
    timestamp: getCurrentTimestamp(),
    includeInHistory: false,
  };
}

export function createUserMessage(text: string): DocumentChatMessage {
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    from: 'user',
    text,
    timestamp: getCurrentTimestamp(),
  };
}

export function createBotMessage(text: string, includeInHistory = true): DocumentChatMessage {
  return {
    id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    from: 'bot',
    text,
    timestamp: getCurrentTimestamp(),
    includeInHistory,
  };
}

const STORAGE_PREFIX = 'lexchain_doc_chat_';

export function getStoredChatMessages(documentId: string): DocumentChatMessage[] {
  if (typeof window === 'undefined') {
    return [createDefaultGreetingMessage()];
  }
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${documentId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Return default greeting if session storage fails
  }
  return [createDefaultGreetingMessage()];
}

export function saveStoredChatMessages(documentId: string, messages: DocumentChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${documentId}`, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('lexchain:chat-updated', { detail: { documentId } }));
  } catch {
    // Ignore storage quota or access errors
  }
}

export function clearStoredChatMessages(documentId: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${documentId}`);
    window.dispatchEvent(new CustomEvent('lexchain:chat-updated', { detail: { documentId } }));
  } catch {
    // Ignore storage errors
  }
}

export async function askDocument(
  id: string,
  question: string,
  history: components['schemas']['ChatTurn'][],
): Promise<string> {
  const res = await fetch(
    `/api/portal/proxy-post?path=${encodeURIComponent(`/documents/${id}/ask`)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history }),
      credentials: 'same-origin',
    },
  );

  if (!res.ok) throw new Error('Failed to get answer');
  const text = await res.text();
  if (!text) return 'No answer returned.';

  try {
    const data = JSON.parse(text);
    return data?.answer ?? data?.response ?? data?.message ?? JSON.stringify(data);
  } catch {
    return text;
  }
}

export function getRandomMockResponse(): string {
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
}
