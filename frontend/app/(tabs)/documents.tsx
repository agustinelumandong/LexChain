import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { toast } from 'sonner-native';

import {
  DocumentsFilterControls,
  DocumentsFilterSheet,
  DocumentsHeader,
  DocumentsListSkeleton,
  DocumentResultCard,
  DocumentsSortSheet,
} from '@/features/documents';
import type {
  DocumentSortKey,
  DocumentTypeKey,
} from '@/types';
import { SearchInputWithResults, BottomNav } from '@/ui';
import { useCloseSheetOnBack } from '@/hooks';
import { useDocuments } from '@/services/query';
import type { DocumentListItem, GlobalSearchResult } from '@/services/api';
import { fetchSearchResultsWithDetails } from '@/services/api/documents.api';
import { parseApiError } from '@/shared/utils/api-error';

import { styles } from '@/features/documents/documents-screen.styles';
import { useQuery } from '@tanstack/react-query';

const DOCUMENT_TYPE_OPTIONS = [
  { label: 'All types', value: 'all' },
  { label: 'Deed of Sale', value: 'deed-of-sale' },
  { label: 'Lease Contract', value: 'lease-contract' },
] as const;

const DOCUMENT_STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Review needed', value: 'review-needed' },
] as const;

const DOCUMENT_SORT_OPTIONS = [
  {
    label: 'Newest first',
    value: 'newest',
    helperText: 'Most recent document dates at the top',
  },
  {
    label: 'Oldest first',
    value: 'oldest',
    helperText: 'Earlier document dates at the top',
  },
  {
    label: 'Title A-Z',
    value: 'title-az',
    helperText: 'Alphabetical by document title',
  },
] as const;

type DisplayDocument = {
  id: string;
  title: string;
  summary: string;
  date: string;
  rawDate: string;
  documentType: DocumentTypeKey;
  status: DocumentFilterStatusKey;
  snippet?: string;
};

type DocumentFilterStatusKey = (typeof DOCUMENT_STATUS_OPTIONS)[number]['value'];

function formatDate(value: string) {
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

function mapStatus(status: string): DocumentFilterStatusKey {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes('verified') || normalizedStatus.includes('complete')) {
    return 'verified';
  }

  return 'review-needed';
}

function mapDocument(item: DocumentListItem): DisplayDocument {
  return {
    id: item.id,
    title: item.file_name,
    summary: '',
    date: formatDate(item.created_at),
    rawDate: item.created_at,
    documentType: 'all',
    status: mapStatus(item.status),
  };
}

function mapSearchResult(result: GlobalSearchResult): DisplayDocument {
  const doc = result.document;

  if (!doc) {
    return {
      id: result.document_id,
      title: 'Unknown Document',
      summary: 'Unable to load details',
      date: '',
      rawDate: '',
      documentType: 'all',
      status: 'review-needed',
      snippet: '',
    };
  }

  return {
    id: doc.document_id,
    title: doc.file_name,
    summary: doc.summary ?? doc.labels?.join(', ') ?? 'No summary available',
    date: formatDate(doc.created_at),
    rawDate: doc.created_at,
    documentType: 'all',
    status: mapStatus(doc.status),
    snippet: doc.summary ?? '',
  };
}

export default function DocumentsScreen() {
  const router = useRouter();
  const isOpeningDocumentRef = useRef(false);
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
  const searchQueryResult = useQuery({
    queryKey: ['search', debouncedSearchQuery],
    queryFn: () => fetchSearchResultsWithDetails({ query: debouncedSearchQuery }),
    enabled: isBackendSearchActive,
  });
  const documents = (documentsQuery.data ?? []).map(mapDocument);
  const searchResults = (searchQueryResult.data ?? []).map(mapSearchResult);

  const matchesStructuredFilters = (document: DisplayDocument) => {
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
  };

  const formatSelectedDate = (value: Date | null) => {
    if (!value) {
      return null;
    }

    return value.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const sortDocuments = (items: DisplayDocument[]) => {
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
  };

  const filteredDocuments = isBackendSearchActive
    ? searchResults
    : sortDocuments(documents.filter(matchesStructuredFilters));
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

  useFocusEffect(
    useCallback(() => {
      isOpeningDocumentRef.current = false;
    }, []),
  );

  const openDocument = useCallback(
    (documentId: string) => {
      if (isOpeningDocumentRef.current) {
        return;
      }

      isOpeningDocumentRef.current = true;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({
        pathname: '/document/[id]',
        params: { id: documentId },
      });
    },
    [router],
  );

  const activeFilterSummary = [
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

  const sortLabel =
    DOCUMENT_SORT_OPTIONS.find((option) => option.value === sortKey)?.label ?? 'Newest first';

  const renderDocumentResult = useCallback(
    ({ item: document, index }: { item: DisplayDocument; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
        <DocumentResultCard
          title={document.title}
          date={document.date}
          onPressCard={() => openDocument(document.id)}
          onPressOpen={() => openDocument(document.id)}
        />
      </Animated.View>
    ),
    [openDocument],
  );

  const renderSearchResult = useCallback(
    (document: DisplayDocument) => (
      <DocumentSearchResultRow
        title={document.title}
        summary={document.snippet ?? document.summary}
        date={document.date}
        onPress={() => openDocument(document.id)}
      />
    ),
    [openDocument],
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <FlatList
          data={isLoadingDocuments ? [] : filteredDocuments}
          keyExtractor={(document, index) => `${document.id}-${index}`}
          renderItem={renderDocumentResult}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          refreshing={documentsQuery.isRefetching}
          onRefresh={() => {
            void documentsQuery.refetch();
          }}
          ListHeaderComponent={
            <>
              <DocumentsHeader />

              <View style={styles.searchWrap}>
                <SearchInputWithResults
                  label="Search documents"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Title, party, date, or keyword"
                  // showDropdown={isBackendSearchActive}
                  // showResults={isBackendSearchActive}
                  results={filteredDocuments}
                  emptyText="No documents matched your search"
                  keyExtractor={(document, index) => `${document.id}-${index}`}
                  renderItem={renderSearchResult}
                />
              </View>

              <DocumentsFilterControls
                activeSummary={activeFilterSummary}
                sortLabel={sortLabel}
                onPressFilter={() => setIsFilterSheetOpen(true)}
                onPressSort={() => setIsSortSheetOpen(true)}
              />
            </>
          }
          ListEmptyComponent={
            isLoadingDocuments ? (
              <DocumentsListSkeleton />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No documents found</Text>
                <Text style={styles.emptyBody}>
                  Try another title, party name, or date.
                </Text>
              </View>
            )
          }
        />

        <View style={styles.navWrap}>
          <BottomNav
            activeTab="documents"
            onPressHome={() => router.push('/(tabs)')}
            onPressDocuments={() => {}}
            onPressProfile={() => router.push('/(tabs)/profile')}
            onPressUpload={() => router.push('/upload')}
          />
        </View>
      </View>

      <DocumentsFilterSheet
        visible={isFilterSheetOpen}
        typeOptions={[...DOCUMENT_TYPE_OPTIONS]}
        statusOptions={[...DOCUMENT_STATUS_OPTIONS]}
        selectedType={documentTypeFilter}
        selectedStatus={documentStatusFilter}
        selectedDate={documentDateFilter}
        onClose={() => setIsFilterSheetOpen(false)}
        onChangeType={(value) => setDocumentTypeFilter(value as DocumentTypeKey)}
        onChangeStatus={(value) =>
          setDocumentStatusFilter(value as DocumentFilterStatusKey)
        }
        onChangeDate={setDocumentDateFilter}
        onClear={() => {
          setDocumentTypeFilter('all');
          setDocumentStatusFilter('all');
          setDocumentDateFilter(null);
        }}
      />

      <DocumentsSortSheet
        visible={isSortSheetOpen}
        options={[...DOCUMENT_SORT_OPTIONS]}
        selectedSort={sortKey}
        onClose={() => setIsSortSheetOpen(false)}
        onSelectSort={(value) => setSortKey(value as DocumentSortKey)}
      />
    </SafeAreaView>
  );
}

type DocumentSearchResultRowProps = {
  title: string;
  summary: string;
  date: string;
  onPress: () => void;
};

function DocumentSearchResultRow({
  title,
  summary,
  date,
  onPress,
}: DocumentSearchResultRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.resultRow,
        pressed && styles.resultRowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.resultCopy}>
        <Text style={styles.resultTitle}>{title}</Text>
        <Text style={styles.resultMeta} numberOfLines={2}>{summary}</Text>
      </View>
      <Text style={styles.resultDate}>{date}</Text>
    </Pressable>
  );
}
