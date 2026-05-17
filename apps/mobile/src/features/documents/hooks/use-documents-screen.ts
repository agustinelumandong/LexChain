import { useEffect, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

import { useCloseSheetOnBack } from '@/hooks';
import { useDocuments } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import type { DocumentSortKey, DocumentTypeKey } from '@/types';

import { DOCUMENT_SORT_OPTIONS } from '../constants/documents-screen.constants';
import type { DocumentFilterStatusKey } from '../types/documents-screen.types';
import {
  getActiveFilterSummary,
  matchesStructuredFilters,
  sortDocuments,
} from '../utils/document-list-filters';
import {
  mapDocumentListItem,
  mapGlobalSearchResult,
} from '../utils/document-list-mappers';
import { useDocumentSearch } from './use-document-search';

export function useDocumentsScreen() {
  const documentsQuery = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<DocumentTypeKey>('all');
  const [documentStatusFilter, setDocumentStatusFilter] =
    useState<DocumentFilterStatusKey>('all');
  const [documentDateFilter, setDocumentDateFilter] = useState<Date | null>(null);
  const [sortKey, setSortKey] = useState<DocumentSortKey>('newest');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const isBackendSearchActive = debouncedSearchQuery.length > 0;
  const searchQueryResult = useDocumentSearch(
    debouncedSearchQuery,
    isBackendSearchActive,
  );
  const documents = useMemo(
    () => (documentsQuery.data ?? []).map(mapDocumentListItem),
    [documentsQuery.data],
  );
  const searchResults = useMemo(
    () => (searchQueryResult.data ?? []).map(mapGlobalSearchResult),
    [searchQueryResult.data],
  );
  const filteredDocuments = useMemo(
    () =>
      isBackendSearchActive
        ? searchResults
        : sortDocuments(
            documents.filter((document) =>
              matchesStructuredFilters({
                document,
                documentDateFilter,
                documentStatusFilter,
                documentTypeFilter,
              }),
            ),
            sortKey,
          ),
    [
      documentDateFilter,
      documentStatusFilter,
      documentTypeFilter,
      documents,
      isBackendSearchActive,
      searchResults,
      sortKey,
    ],
  );
  const isAnySheetOpen = isFilterSheetOpen || isSortSheetOpen;
  const isLoadingDocuments =
    documentsQuery.isLoading || (isBackendSearchActive && searchQueryResult.isLoading);

  useEffect(() => {
    if (documentsQuery.error) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error(parseApiError(documentsQuery.error).message);
    }

    if (searchQueryResult.error) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error(parseApiError(searchQueryResult.error).message);
    }
  }, [documentsQuery.error, searchQueryResult.error]);

  useCloseSheetOnBack(isAnySheetOpen, () => {
    setIsFilterSheetOpen(false);
    setIsSortSheetOpen(false);
  });

  const activeFilterSummary = useMemo(
    () =>
      getActiveFilterSummary({
        documentDateFilter,
        documentStatusFilter,
        documentTypeFilter,
      }),
    [documentDateFilter, documentStatusFilter, documentTypeFilter],
  );

  const sortLabel =
    DOCUMENT_SORT_OPTIONS.find((option) => option.value === sortKey)?.label ?? 'Newest first';

  return {
    activeFilterSummary,
    documentDateFilter,
    documentStatusFilter,
    documentTypeFilter,
    documentsQuery,
    filteredDocuments,
    isFilterSheetOpen,
    isLoadingDocuments,
    isSortSheetOpen,
    searchQuery,
    sortKey,
    sortLabel,
    setDocumentDateFilter,
    setDocumentStatusFilter,
    setDocumentTypeFilter,
    setIsFilterSheetOpen,
    setIsSortSheetOpen,
    setSearchQuery,
    setSortKey,
  };
}
