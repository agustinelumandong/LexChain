import type {
  BookCreateRequest,
  BookResponse,
  ListBooksParams,
} from '../books.api';

import { mockDelay } from './delay';

let mockBooks: BookResponse[] = [
  {
    id: '3e45fef9-d9dd-4f98-9bf3-e5a77a4a8c11',
    book_number: 1,
    series_year: 2026,
    document_count: 3,
    page_count: 42,
    is_full: false,
    created_at: '2026-05-01T08:00:00.000Z',
    updated_at: '2026-05-26T10:30:00.000Z',
  },
  {
    id: 'fd1340f4-772c-4de6-94f2-e2ff2b03bb59',
    book_number: 2,
    series_year: 2026,
    document_count: 0,
    page_count: 0,
    is_full: false,
    created_at: '2026-05-18T09:15:00.000Z',
    updated_at: null,
  },
];

export const mockBooksApi = {
  async list(params?: ListBooksParams): Promise<BookResponse[]> {
    await mockDelay();

    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? mockBooks.length;

    return mockBooks.slice(offset, offset + limit);
  },

  async getById(bookId: string): Promise<BookResponse> {
    await mockDelay();

    const book = mockBooks.find((item) => item.id === bookId);

    if (!book) {
      throw new Error('Book not found');
    }

    return book;
  },

  async create(payload: BookCreateRequest): Promise<BookResponse> {
    await mockDelay();

    const createdAt = new Date().toISOString();
    const book: BookResponse = {
      id: `mock-book-${Date.now()}`,
      book_number: payload.book_number,
      series_year: payload.series_year,
      document_count: 0,
      page_count: 0,
      is_full: false,
      created_at: createdAt,
      updated_at: null,
    };

    mockBooks = [book, ...mockBooks];

    return book;
  },
};
