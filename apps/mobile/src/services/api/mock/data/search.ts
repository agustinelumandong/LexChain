import type { GlobalSearchResponse } from '@/services/api/documents.api';

export const MOCK_GLOBAL_SEARCH_RESPONSE: GlobalSearchResponse = {
  query: 'Memo',
  results: [
    {
      chunk_id: 'e720b0c8-f156-40ea-87ab-61accbf85115',
      document_id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
      chunk_index: 1,
      score: 0.13627782057887905,
      text: 'DepEd memorandum guidelines and reporting requirements for school records.',
    },
    {
      chunk_id: '357ce4c4-7d94-4c00-a094-4404761bb05a',
      document_id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
      chunk_index: 2,
      score: 0.13627782057887905,
      text: 'Administrative memo section with dates, offices, and document references.',
    },
    {
      chunk_id: '4efd1129-db70-4bd3-9b65-6942e6b8ee8f',
      document_id: 'eb1d48cf-2313-4edb-b2e9-4667f6faf449',
      chunk_index: 0,
      score: 0.13627782057887905,
      text: 'Header section identifying the memorandum and issuing department.',
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
