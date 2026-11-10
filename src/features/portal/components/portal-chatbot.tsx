'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { isMockMode } from '@/lib/mocks/mode';
import {
  askDocument,
  createBotMessage,
  createUserMessage,
  DEFAULT_SUGGESTED_QUESTIONS,
  type DocumentChatMessage,
  getRandomMockResponse,
  getStoredChatMessages,
  saveStoredChatMessages,
} from '@/features/portal/lib/document-chat';

export default function PortalChatbot({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DocumentChatMessage[]>(() =>
    getStoredChatMessages(documentId),
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync when external storage updates occur (e.g. from full-screen page)
  useEffect(() => {
    const handleStorageUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ documentId?: string }>;
      if (!customEvent.detail || customEvent.detail.documentId === documentId) {
        setMessages(getStoredChatMessages(documentId));
      }
    };

    window.addEventListener('lexchain:chat-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('lexchain:chat-updated', handleStorageUpdate);
    };
  }, [documentId]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
    }
  }, [messages, loading, open]);

  async function send(queryText?: string) {
    const question = (queryText ?? input).trim();
    if (!question || loading) return;

    const userMessage = createUserMessage(question);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    saveStoredChatMessages(documentId, nextMessages);
    setInput('');

    const history = nextMessages
      .filter(({ includeInHistory }) => includeInHistory !== false)
      .slice(-10)
      .map(({ from, text }) => ({
        role: from === 'user' ? ('user' as const) : ('assistant' as const),
        content: text.slice(0, 4000),
      }));

    if (isMockMode()) {
      const botResponse = createBotMessage(getRandomMockResponse());
      const updated = [...nextMessages, botResponse];
      setMessages(updated);
      saveStoredChatMessages(documentId, updated);
      return;
    }

    setLoading(true);
    try {
      const answer = await askDocument(documentId, question, history);
      const botResponse = createBotMessage(answer);
      const updated = [...nextMessages, botResponse];
      setMessages(updated);
      saveStoredChatMessages(documentId, updated);
    } catch {
      const errorResponse = createBotMessage(
        'Sorry, I could not get an answer. Please try again.',
        false,
      );
      const updated = [...nextMessages, errorResponse];
      setMessages(updated);
      saveStoredChatMessages(documentId, updated);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open document assistant"
          title="Ask about this document"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-[#0067B3] px-4 py-3 text-white shadow-[0_8px_24px_rgba(0,103,179,0.35)] transition-all duration-200 hover:scale-105 hover:bg-[#005a9e] hover:shadow-[0_12px_28px_rgba(0,103,179,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] active:scale-95"
        >
          <ChatIcon aria-hidden="true" sx={{ fontSize: 20 }} />
          <span className="text-sm font-bold tracking-tight">Ask Document</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white/50 animate-pulse" title="AI Ready" />
        </button>
      ) : (
        <section
          id="document-assistant-panel"
          role="dialog"
          aria-label="Ask about this document"
          className="fixed bottom-6 right-4 sm:right-6 z-50 flex h-[580px] w-[calc(100vw-2rem)] sm:w-[460px] max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-[20px] border border-[#DCE8F6] bg-white shadow-[0_16px_50px_rgba(12,43,73,0.18)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8F0F8] bg-white px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0067B3] to-[#2596be] text-white shadow-xs">
                <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#0C2B49] leading-tight">Ask about this document</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      loading ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                  <span className="text-xs font-semibold text-[#5B6F8A]">
                    {loading ? 'Analyzing document…' : 'Document Assistant • Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href={`/portal/documents/${documentId}/ask`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#DCE8F6] bg-[#F4F8FC] px-3 py-1 text-xs font-bold text-[#0067B3] transition-colors hover:bg-[#EAF4FF] hover:border-[#0067B3]/40"
                aria-label="Open full-page assistant"
                title="Open in full screen"
              >
                <OpenInFullIcon aria-hidden="true" sx={{ fontSize: 14 }} />
                <span>Full screen</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close document assistant"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#5B6F8A] transition-colors hover:bg-[#F2F7FC] hover:text-[#0C2B49]"
              >
                <CloseIcon aria-hidden="true" fontSize="small" />
              </button>
            </div>
          </div>

          {/* Conversation Body */}
          <div
            role="log"
            aria-label="Document assistant conversation"
            aria-live="polite"
            aria-relevant="additions"
            className="flex-1 space-y-3.5 overflow-y-auto bg-[#FBFDFF] p-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.from === 'user' ? 'flex justify-end' : 'flex justify-start gap-2.5'}
              >
                {message.from === 'bot' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EAF4FF] text-[#0067B3] mt-0.5">
                    <AutoAwesomeIcon sx={{ fontSize: 14 }} />
                  </div>
                )}
                <div
                  className={
                    message.from === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-tr-xs bg-[#0067B3] px-3.5 py-2.5 text-sm text-white shadow-xs'
                      : 'max-w-[85%] rounded-2xl rounded-tl-xs border border-[#E1EEFA] bg-white px-3.5 py-2.5 text-sm text-[#0C2B49] shadow-xs'
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <div
                    className={`mt-1 flex items-center justify-end text-xs font-medium ${
                      message.from === 'user' ? 'text-blue-100' : 'text-[#879BB0]'
                    }`}
                  >
                    <span>{message.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EAF4FF] text-[#0067B3] mt-0.5">
                  <AutoAwesomeIcon sx={{ fontSize: 14 }} />
                </div>
                <div className="rounded-2xl rounded-tl-xs border border-[#E1EEFA] bg-white px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#0067B3] animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-[#0067B3] animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-[#0067B3] animate-bounce" />
                    <p role="status" className="ml-1 text-xs font-semibold text-[#5B6F8A]">
                      Thinking…
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.length <= 1 && (
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5B6F8A]">
                  Suggested questions
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {DEFAULT_SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void send(question)}
                      className="rounded-xl border border-[#E2ECF7] bg-white px-3 py-2 text-left text-xs font-semibold text-[#0C2B49] shadow-xs transition-colors hover:border-[#0067B3] hover:bg-[#F0F7FF] hover:text-[#0067B3]"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Footer Input Area */}
          <div className="space-y-2 border-t border-[#E8F0F8] bg-white p-3.5">
            <p className="text-xs leading-4 text-[#5B6F8A]">
              AI-generated help. Check the original PDF before relying on an answer.
            </p>
            <div className="flex items-center gap-2 rounded-full border border-[#DCE8F6] bg-[#F8FAFD] p-1.5 transition-colors focus-within:border-[#0067B3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0067B3]/20">
              <input
                value={input}
                name="question"
                aria-label="Ask a question about this document"
                autoComplete="off"
                autoFocus
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask a question about this document…"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#0C2B49] outline-none placeholder:text-[#879BB0]"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={!input.trim() || loading}
                aria-label="Send question"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0067B3] text-white shadow-xs transition-colors hover:bg-[#005a9e] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SendIcon aria-hidden="true" sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
