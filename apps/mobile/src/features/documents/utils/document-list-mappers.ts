import type { DocumentListItem, GlobalSearchResult } from '@/services/api';

import type {
  DisplayDocument,
  DocumentStatusKey,
} from '../types/documents-screen.types';

export function formatDocumentListDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function mapDocumentStatus(status: string): DocumentStatusKey {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes('tampered')) {
    return 'tampered';
  }
  if (normalizedStatus.includes('fail')) {
    return 'failed';
  }
  if (normalizedStatus.includes('success')) {
    return 'successful';
  }
  if (normalizedStatus.includes('verified') || normalizedStatus.includes('complete') || normalizedStatus.includes('accepted')) {
    return 'verified';
  }

  return 'verified';
}

export function mapDocumentListItem(item: DocumentListItem): DisplayDocument {
  return {
    id: item.id,
    title: item.file_name,
    summary: '',
    date: formatDocumentListDate(item.created_at),
    rawDate: item.created_at,
    documentType: 'all',
    onChain: item.on_chain,
    status: mapDocumentStatus(item.status),
    documentNumber: item.document_number ?? 0,
    bookNumber: item.book_number ?? 0,
    pageNumber: item.page_number ?? 0,
    series: item.series ?? 0,
  };
}

export function mapGlobalSearchResult(result: GlobalSearchResult): DisplayDocument {
  const doc = result.document;

  if (!doc) {
    return {
      id: result.document_id,
      title: 'Unknown Document',
      summary: 'Unable to load details',
      date: '',
      rawDate: '',
      documentType: 'all',
      onChain: false,
      status: 'failed',
      snippet: result.hit.text,
      searchChunkId: result.hit.chunk_id,
      searchChunkIndex: result.hit.chunk_index,
      searchRank: result.rank,
      searchScore: result.hit.score,
      documentNumber: 0,
      bookNumber: 0,
      pageNumber: 0,
      series: 0,
    };
  }

  return {
    id: doc.document_id,
    title: doc.file_name,
    summary: doc.summary ?? doc.labels?.join(', ') ?? 'No summary available',
    date: formatDocumentListDate(doc.created_at),
    rawDate: doc.created_at,
    documentType: 'all',
    onChain: doc.on_chain,
    status: mapDocumentStatus(doc.status),
    snippet: result.hit.text,
    searchChunkId: result.hit.chunk_id,
    searchChunkIndex: result.hit.chunk_index,
    searchRank: result.rank,
    searchScore: result.hit.score,
    documentNumber: doc.document_number ?? 0,
    bookNumber: 0,
    pageNumber: 0,
    series: 0,
  };
}
