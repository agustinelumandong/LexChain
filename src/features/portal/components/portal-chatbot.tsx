'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import SendIcon from '@mui/icons-material/Send';
import { isMockMode } from '@/lib/mocks/mode';

const mockResponses = [
  'Based on the document, the contract term is 12 months with automatic renewal.',
  'The key parties involved are LexChain Corp and Acme Inc.',
  'There are 2 risk flags identified: auto-renewal without notice and unlimited liability.',
  'The monthly payment obligation is $5,000 due by the 15th of each month.',
];

const suggestedQuestions = [
  'What are the key dates?',
  'Who are the parties?',
  'What should I review?',
];

type Message = { from: 'bot' | 'user'; text: string };

async function askDocument(id: string, question: string): Promise<string> {
  const res = await fetch(
    `/api/portal/proxy-post?path=${encodeURIComponent(`/documents/${id}/ask`)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
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

export default function PortalChatbot({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Ask me a question about this document.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, loading, open]);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((current) => [...current, { from: 'user', text: question }]);
    setInput('');

    if (isMockMode()) {
      setMessages((current) => [
        ...current,
        { from: 'bot', text: mockResponses[Math.floor(Math.random() * mockResponses.length)] },
      ]);
      return;
    }

    setLoading(true);
    try {
      const answer = await askDocument(documentId, question);
      setMessages((current) => [...current, { from: 'bot', text: answer }]);
    } catch {
      setMessages((current) => [...current, { from: 'bot', text: 'Sorry, I could not get an answer. Please try again.' }]);
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
          className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0067B3] text-white shadow-[0_8px_20px_rgba(22,137,245,0.2)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
        >
          <ChatIcon aria-hidden="true" />
        </button>
      ) : (
        <section
          id="document-assistant-panel"
          role="dialog"
          aria-label="Ask about this document"
          className="fixed bottom-24 left-4 right-4 z-50 flex h-[480px] max-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-[18px] border border-[var(--portal-border-soft)] bg-white shadow-[0_10px_40px_rgba(19,59,115,0.16)] sm:left-auto sm:right-4 sm:w-[360px]"
        >
          <div className="flex items-center justify-between border-b border-[var(--portal-border-soft)] px-4 py-3">
            <h2 className="font-bold text-[var(--portal-navy)]">Ask about this document</h2>
            <div className="flex items-center gap-2">
              <Link href={`/portal/documents/${documentId}/ask`} className="inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-xs font-bold text-[#0067B3] hover:bg-[#EAF4FF]" aria-label="Open full-page assistant">
                <OpenInFullIcon aria-hidden="true" sx={{ fontSize: 16 }} /> Full page
              </Link>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close document assistant" className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--portal-navy)] hover:bg-[#F2F7FC]">
                <CloseIcon aria-hidden="true" fontSize="small" />
              </button>
            </div>
          </div>

          <div role="log" aria-label="Document assistant conversation" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={index} className={message.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <p className={message.from === 'user' ? 'max-w-[85%] rounded-[14px] rounded-br-sm bg-[#0067B3] p-3 text-sm text-white' : 'max-w-[85%] rounded-[14px] rounded-bl-sm bg-[#EAF4FF] p-3 text-sm text-[#0C2B49]'}>
                  {message.text}
                </p>
              </div>
            ))}
            {loading && <p role="status" className="text-sm text-[#4B6382]">Thinking…</p>}
            {messages.length === 1 && <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#4B6382]">Suggested questions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => <button key={question} type="button" onClick={() => setInput(question)} className="min-h-11 rounded-full border border-[var(--portal-border-soft)] px-3 py-2 text-xs font-semibold text-[var(--portal-navy)] hover:bg-[#EAF4FF]">{question}</button>)}
              </div>
            </div>}
            <div ref={bottomRef} />
          </div>

          <div className="space-y-2 border-t border-[var(--portal-border-soft)] px-4 py-3">
            <p className="text-xs leading-5 text-[#4B6382]">AI-generated help. Check the original PDF before relying on an answer.</p>
            <div className="flex items-center gap-2 rounded-full border border-[var(--portal-border-soft)] bg-white p-1.5 focus-within:border-[#0067B3] focus-within:ring-2 focus-within:ring-[#0067B3] focus-within:ring-offset-1">
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
                placeholder="Ask a question…"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#0C2B49] outline-none placeholder:text-[#4B6382]"
              />
              <button type="button" onClick={() => void send()} disabled={!input.trim() || loading} aria-label="Send question" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0067B3] text-white disabled:opacity-40">
                <SendIcon aria-hidden="true" sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
