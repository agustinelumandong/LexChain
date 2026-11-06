import type { RegisterBook } from '@/features/office/books-api';

export function latestRegisterBook(books: RegisterBook[]): RegisterBook | undefined {
  return books.reduce<RegisterBook | undefined>(
    (latest, book) => !latest || Date.parse(book.created_at) > Date.parse(latest.created_at) ? book : latest,
    undefined,
  );
}
