'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SendIcon from '@mui/icons-material/Send';
import { isMockMode } from '@/lib/mocks/mode';
import {
  askDocument,
  clearStoredChatMessages,
  createBotMessage,
  createUserMessage,
  DEFAULT_SUGGESTED_QUESTIONS,
  type DocumentChatMessage,
  getRandomMockResponse,
  getStoredChatMessages,
  saveStoredChatMessages,
} from '@/features/portal/lib/document-chat';

export default function AskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<DocumentChatMessage[]>(() =>
    getStoredChatMessages(id),
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStorageUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ documentId?: string }>;
      if (!customEvent.detail || customEvent.detail.documentId === id) {
        setMessages(getStoredChatMessages(id));
      }
    };

    window.addEventListener('lexchain:chat-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('lexchain:chat-updated', handleStorageUpdate);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(queryText?: string) {
    const question = (queryText ?? input).trim();
    if (!question || loading) return;

    const userMessage = createUserMessage(question);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    saveStoredChatMessages(id, nextMessages);
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
      saveStoredChatMessages(id, updated);
      return;
    }

    setLoading(true);
    try {
      const answer = await askDocument(id, question, history);
      const botResponse = createBotMessage(answer);
      const updated = [...nextMessages, botResponse];
      setMessages(updated);
      saveStoredChatMessages(id, updated);
    } catch {
      const errorResponse = createBotMessage(
        'Sorry, I could not get an answer. Please try again.',
        false,
      );
      const updated = [...nextMessages, errorResponse];
      setMessages(updated);
      saveStoredChatMessages(id, updated);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    clearStoredChatMessages(id);
    setMessages(getStoredChatMessages(id));
  }

  return (
    <div className="flex h-[calc(100dvh-100px)] w-full flex-col gap-3 max-w-5xl mx-auto pb-4">
      {/* Top Bar with Navigation and Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8F0F8] pb-3 pt-1">
        <Link
          href={`/portal/documents/${id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE8F6] bg-white px-3.5 py-1.5 text-xs font-bold text-[#0C2B49] shadow-xs transition-colors hover:border-[#0067B3] hover:text-[#0067B3]"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to Document
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-[#DCE8F6] bg-white px-3 py-1 shadow-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                loading ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span className="text-xs font-semibold text-[#0C2B49]">
              {loading ? 'Analyzing document…' : 'Document Assistant • Active'}
            </span>
            <span className="text-xs text-[#879BB0]">·</span>
            <span className="text-xs font-mono font-medium text-[#5B6F8A]">{id}</span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Clear chat history"
            title="Clear chat history"
            className="inline-flex items-center gap-1 rounded-full border border-[#DCE8F6] bg-white px-2.5 py-1 text-xs font-semibold text-[#5B6F8A] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          >
            <RestartAltIcon sx={{ fontSize: 15 }} />
            <span>New chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container Card */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-[#DCE8F6] bg-white shadow-sm">
        {/* Chat Log */}
        <div
          role="log"
          aria-label="Document assistant conversation"
          aria-live="polite"
          aria-relevant="additions"
          className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[#FBFDFF] p-4 sm:p-6"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.from === 'user' ? 'flex justify-end' : 'flex justify-start gap-3'}
            >
              {msg.from === 'bot' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0067B3] to-[#2596be] text-white shadow-xs mt-0.5">
                  <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                </div>
              )}
              <div
                className={
                  msg.from === 'user'
                    ? 'max-w-[80%] sm:max-w-[70%] rounded-2xl rounded-tr-xs bg-[#0067B3] p-4 text-sm text-white shadow-xs'
                    : 'max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tl-xs border border-[#E1EEFA] bg-white p-4 text-sm text-[#0C2B49] shadow-xs'
                }
              >
                {msg.from === 'bot' && (
                  <div className="mb-1 flex items-center justify-between gap-4 border-b border-[#F0F5FA] pb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0067B3]">
                      LexChain Assistant
                    </span>
                    <span className="text-[10px] text-[#879BB0]">{msg.timestamp}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                {msg.from === 'user' && (
                  <div className="mt-1 flex items-center justify-end text-[10px] text-blue-100">
                    <span>{msg.timestamp}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0067B3] to-[#2596be] text-white shadow-xs mt-0.5">
                <AutoAwesomeIcon sx={{ fontSize: 16 }} />
              </div>
              <div className="rounded-2xl rounded-tl-xs border border-[#E1EEFA] bg-white p-4 shadow-xs">
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
            <div className="mt-2 rounded-2xl border border-dashed border-[#CFE1F4] bg-[#F4F9FE] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0067B3]">
                <AutoAwesomeIcon sx={{ fontSize: 15 }} />
                <span>Suggested Questions</span>
              </div>
              <p className="mt-1 text-xs text-[#5B6F8A]">
                Click any prompt to ask immediately, or type your own question below:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DEFAULT_SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void send(question)}
                    className="rounded-full border border-[#D0E2F5] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0C2B49] shadow-xs transition-all hover:border-[#0067B3] hover:bg-[#EAF4FF] hover:text-[#0067B3]"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-[#E8F0F8] bg-white p-3.5 sm:p-4">
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
              placeholder="Ask anything about this document… (e.g. key obligations, termination clauses, parties)"
              className="flex-1 bg-transparent px-4 text-sm text-[#0C2B49] outline-none placeholder:text-[#879BB0]"
            />
            <button
              onClick={() => void send()}
              disabled={!input.trim() || loading}
              aria-label="Send question"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0067B3] text-white shadow-xs transition-colors hover:bg-[#005a9e] disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-[#879BB0]">
            AI-generated assistance. Check the original PDF before relying on an answer for legal decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
