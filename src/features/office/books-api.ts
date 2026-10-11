import type { ApiSchema } from '@/shared/types';

export type RegisterBook = ApiSchema<'BookResponse'>;

export async function listRegisterBooks(): Promise<RegisterBook[]> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent('/books/?limit=50&offset=0')}`, {
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Unable to load books');
  return response.json() as Promise<RegisterBook[]>;
}
