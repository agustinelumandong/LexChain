'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

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

export default function AskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setMessages((current) => [...current, { role: 'user', text: question }]);
    setLoading(true);

    try {
      const answer = await askDocument(id, question);
      setMessages((current) => [...current, { role: 'ai', text: answer }]);
    } catch {
      setMessages((current) => [...current, { role: 'ai', text: 'Sorry, I could not get an answer. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] max-w-2xl flex-col gap-4">
      <Link href={`/portal/documents/${id}`} className="flex w-fit items-center gap-1 text-sm font-bold text-[#64748b] hover:text-[#0985E7]">
        <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Document
      </Link>

      <div>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Ask AI</h1>
        <p className="mt-1 text-sm text-[#64748b]">Ask anything about this document.</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <SmartToyIcon sx={{ fontSize: 48, color: '#0985E7' }} />
            <p className="text-sm font-bold text-[#0C2B49]">Ask a question about this document</p>
            <p className="text-xs text-[#64748b]">Try: summarize main obligations, parties, or risk points.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === 'ai' ? 'bg-[#EEF6FF]' : 'bg-[#0985E7]'}`}>
              {message.role === 'ai'
                ? <SmartToyIcon sx={{ fontSize: 18, color: '#0985E7' }} />
                : <PersonIcon sx={{ fontSize: 18, color: 'white' }} />
              }
            </div>
            <div className={`max-w-[80%] whitespace-pre-wrap rounded-[14px] px-4 py-3 text-sm ${message.role === 'ai' ? 'border border-[#E8F0F8] bg-white text-[#0C2B49]' : 'bg-[#0985E7] text-white'}`}>
              {message.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF6FF]">
              <SmartToyIcon sx={{ fontSize: 18, color: '#0985E7' }} />
            </div>
            <div className="flex items-center gap-1 rounded-[14px] border border-[#E8F0F8] bg-white px-4 py-3">
              {[0, 1, 2].map((index) => (
                <span key={index} className="h-2 w-2 animate-bounce rounded-full bg-[#0985E7]" style={{ animationDelay: `${index * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 rounded-[18px] border border-[#E8F0F8] bg-white p-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          placeholder="Ask a question..."
          className="flex-1 bg-transparent px-3 text-sm text-[#0C2B49] outline-none placeholder:text-[#A0AAB8]"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          aria-label="Send question"
          className="rounded-[12px] bg-[#0985E7] p-2.5 text-white transition hover:bg-[#0770c4] disabled:opacity-40"
          type="button"
        >
          <SendIcon sx={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
}
