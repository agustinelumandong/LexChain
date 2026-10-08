'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { searchPortalDocuments } from '@/features/documents/search-api';

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const router = useRouter();
  const query = use(searchParams).q ?? '';
  const [input, setInput] = useState(query);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['portal-search', query],
    queryFn: () => searchPortalDocuments(query),
    enabled: query.trim().length > 0,
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextQuery = input.trim();
    if (nextQuery) router.push(`/portal/search?q=${encodeURIComponent(nextQuery)}`);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <h1 className="text-[28px] font-black text-[#0C2B49]">Search</h1>

      <form onSubmit={submit} className="flex gap-2 rounded-[18px] border border-[#E8F0F8] bg-white p-2">
        <SearchIcon sx={{ color: '#64748b', ml: 1, alignSelf: 'center' }} />
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search across all your documents..."
          className="flex-1 bg-transparent px-2 text-sm text-[#0C2B49] outline-none placeholder:text-[#A0AAB8]"
        />
        <button type="submit" className="rounded-[12px] bg-[#0985E7] px-4 py-2 text-xs font-black text-white hover:bg-[#0770c4]">
          Search
        </button>
      </form>

      {!query && (
        <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
          <p className="text-sm font-bold text-[#0C2B49]">Search your documents</p>
          <p className="mt-1 text-xs text-[#64748b]">Enter keywords or a question to find matching document text.</p>
        </div>
      )}

      {(isLoading || isFetching) && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((index) => <div key={index} className="h-20 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />)}
        </div>
      )}

      {isError && <p role="alert" className="text-sm font-bold text-red-500">Search failed. Please try again.</p>}

      {data && !isFetching && (
        <>
          <p className="text-xs font-bold text-[#64748b]">
            {data.results.length} result{data.results.length !== 1 ? 's' : ''} for &ldquo;{data.query}&rdquo;
          </p>
          {data.results.length === 0 && (
            <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
              <p className="text-sm font-bold text-[#0C2B49]">No results found</p>
              <p className="mt-1 text-xs text-[#64748b]">Try different keywords.</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {data.results.map((result) => (
              <Link
                key={result.chunk_id}
                href={`/portal/documents/${result.document_id}`}
                className="block rounded-[18px] border border-[#E8F0F8] bg-white p-4 transition hover:border-[#0985E7]"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <InsertDriveFileIcon sx={{ fontSize: 16, color: '#0985E7' }} />
                  <span className="text-xs font-black text-[#0985E7]">Document ID: {result.document_id}</span>
                  <span className="text-[11px] font-semibold text-[#64748b]">Chunk ID: {result.chunk_id}</span>
                  <span className="text-[11px] font-semibold text-[#64748b]">Chunk index: {result.chunk_index}</span>
                  <span className="ml-auto text-[11px] font-bold text-[#A0AAB8]">Score: {result.score}</span>
                </div>
                {result.text?.trim() && <p className="line-clamp-3 text-sm text-[#0C2B49]">{result.text}</p>}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
