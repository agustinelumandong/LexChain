import type { GlobalSearchResponse } from '@/services/api/documents.api';

export const MOCK_GLOBAL_SEARCH_RESPONSE: GlobalSearchResponse = {
  query: 'Maria Santos',
  results: [
    {
      chunk_id: 'e720b0c8-f156-40ea-87ab-61accbf85115',
      document_id: '550e8400-e29b-41d4-a716-446655440003',
      chunk_index: 1,
      score: 0.94,
      text: 'Special power of attorney appointing Maria Martinez for real estate transactions.',
    },
    {
      chunk_id: '357ce4c4-7d94-4c00-a094-4404761bb05a',
      document_id: '550e8400-e29b-41d4-a716-446655440002',
      chunk_index: 2,
      score: 0.71,
      text: 'Lease agreement references tenant records and related family holdings.',
    },
    {
      chunk_id: '4efd1129-db70-4bd3-9b65-6942e6b8ee8f',
      document_id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
      chunk_index: 0,
      score: 0.42,
      text: 'DepEd memorandum section with administrative contacts and document references.',
    },
  ],
};

export const MOCK_GLOBAL_SEARCH_EMPTY: GlobalSearchResponse = {
  query: 'xyz123 nonexistent',
  results: [],
};

export const MOCK_GLOBAL_SEARCH_SINGLE_RESULT: GlobalSearchResponse = {
  query: 'Deed of Sale',
  results: [
    {
      chunk_id: 'e720b0c8-f156-40ea-87ab-61accbf85115',
      document_id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
      chunk_index: 0,
      score: 0.98,
      text: 'Deed of sale content mentioning parties, property, and consideration.',
    },
  ],
};

export const MOCK_DOCUMENT_SEARCH_RESPONSE = {
  query: 'hey what is this for?',
  document_id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
  results: [
    {
      chunk_id: 'e720b0c8-f156-40ea-87ab-61accbf85115',
      chunk_index: 1,
      score: 0.03186004784225571,
      text: 'Republic of the Philippines\nDepartment of Education\n\nMAY 06 2026\nDepEd MEMORANDUM\n\nNo. 028, s. 2026\n\nGUIDELINES ON THE BASIC EDUCATION INFORMATION SYSTEM...',
    },
  ],
};

export const MOCK_DOCUMENT_SEARCH_EMPTY = {
  query: 'nonexistent term xyz123',
  document_id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
  results: [],
};
