import type { DocumentSortKey, DocumentTypeKey } from '@/types';

import type {
  DisplayDocument,
  DocumentFilterStatusKey,
} from '../types/documents-screen.types';
import {
  DOCUMENT_STATUS_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
} from '../constants/documents-screen.constants';

export function matchesStructuredFilters({
  document,
  documentDateFilter,
  documentStatusFilter,
  documentTypeFilter,
}: {
  document: DisplayDocument;
  documentDateFilter: Date | null;
  documentStatusFilter: DocumentFilterStatusKey;
  documentTypeFilter: DocumentTypeKey;
}) {
  if (documentTypeFilter !== 'all' && document.documentType !== documentTypeFilter) {
    return false;
  }

  if (documentStatusFilter !== 'all' && document.status !== documentStatusFilter) {
    return false;
  }

  if (documentDateFilter) {
    const documentDate = new Date(document.rawDate);

    if (
      documentDate.getFullYear() !== documentDateFilter.getFullYear() ||
      documentDate.getMonth() !== documentDateFilter.getMonth() ||
      documentDate.getDate() !== documentDateFilter.getDate()
    ) {
      return false;
    }
  }

  return true;
}

export function formatSelectedDate(value: Date | null) {
  if (!value) {
    return null;
  }

  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function sortDocuments(items: DisplayDocument[], sortKey: DocumentSortKey) {
  if (sortKey === 'newest') {
    return [...items].sort((left, right) => right.rawDate.localeCompare(left.rawDate));
  }

  if (sortKey === 'oldest') {
    return [...items].sort((left, right) => left.rawDate.localeCompare(right.rawDate));
  }

  if (sortKey === 'title-az') {
    return [...items].sort((left, right) => left.title.localeCompare(right.title));
  }

  return items;
}

export function getActiveFilterSummary({
  documentDateFilter,
  documentStatusFilter,
  documentTypeFilter,
}: {
  documentDateFilter: Date | null;
  documentStatusFilter: DocumentFilterStatusKey;
  documentTypeFilter: DocumentTypeKey;
}) {
  return [
    documentTypeFilter !== 'all'
      ? `Type: ${
          DOCUMENT_TYPE_OPTIONS.find((option) => option.value === documentTypeFilter)?.label ?? ''
        }`
      : null,
    documentStatusFilter !== 'all'
      ? `Status: ${
          DOCUMENT_STATUS_OPTIONS.find((option) => option.value === documentStatusFilter)?.label ??
          ''
        }`
      : null,
    documentDateFilter
      ? `Date: ${formatSelectedDate(documentDateFilter) ?? ''}`
      : null,
  ].filter(Boolean) as string[];
}
