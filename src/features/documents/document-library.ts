import type { ApiSchema } from "@/shared/types";

export type DocumentListItem = ApiSchema<'DocumentUploadResponse'>;

export type DocumentListFilters = {
  query: string;
  lifecycle: string;
  sort: 'newest' | 'oldest' | 'title';
  createdFrom?: string;
  createdThrough?: string;
};

function searchableReference(document: DocumentListItem) {
  return [document.doc_no, document.page_no, document.id]
    .filter((value): value is string | number => value !== undefined && value !== null)
    .join(' ')
    .toLowerCase();
}

function documentDate(document: DocumentListItem) {
  return new Date(document.created_at).getTime();
}

export function getVisibleDocuments<T extends DocumentListItem>(documents: T[], filters: DocumentListFilters): T[] {
  const query = filters.query.trim().toLowerCase();

  return documents
    .filter((document) => !query || document.file_name?.toLowerCase().includes(query) || searchableReference(document).includes(query))
    .filter((document) => filters.lifecycle === 'all' || document.lifecycle.trim().toLowerCase() === filters.lifecycle)
    .filter((document) => {
      if (!filters.createdFrom && !filters.createdThrough) return true;
      const date = new Date(documentDate(document));
      if (Number.isNaN(date.getTime())) return false;
      const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return (!filters.createdFrom || day >= filters.createdFrom) && (!filters.createdThrough || day <= filters.createdThrough);
    })
    .sort((left, right) => {
      if (filters.sort === 'title') return (left.file_name ?? '').localeCompare(right.file_name ?? '');
      const difference = documentDate(left) - documentDate(right);
      return filters.sort === 'oldest' ? difference : -difference;
    });
}

export function getDocumentLifecycles(documents: DocumentListItem[]) {
  return [...new Set(documents.map((document) => document.lifecycle.trim().toLowerCase()))];
}
