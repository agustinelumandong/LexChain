import React, { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SearchInputWithResults } from '@/ui';
import type { DocumentSortKey, DocumentTypeKey } from '@/types';
import { DocumentResultCard } from '@/features/documents/components/list/document-result-card';
import { DocumentsFilterControls } from '@/features/documents/components/filter/documents-filter-controls';
import { DocumentsFilterSheet } from '@/features/documents/components/filter/documents-filter-sheet';
import { DocumentsHeader } from '@/features/documents/components/list/documents-header';
import { DocumentsListSkeleton } from '@/features/documents/components/list/documents-list-skeleton';
import { DocumentsSortSheet } from '@/features/documents/components/sort/documents-sort-sheet';
import {
  DOCUMENT_SORT_OPTIONS,
  DOCUMENT_STATUS_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
} from '@/features/documents/constants/documents-screen.constants';
import { DocumentSearchResultRow } from '@/features/documents/components/document-search-result-row';
import { styles } from '@/features/documents/components/list/documents-screen.styles';
import { useDocumentsScreen } from '@/features/documents/hooks/use-documents-screen';
import { APP_COLORS } from '@/theme';
import { useUiShellStore } from '@/shared/stores/ui-shell-store';
import type {
  DisplayDocument,
  DocumentFilterStatusKey,
} from '@/features/documents/types/documents-screen.types';

export default function DocumentsScreen() {
  const router = useRouter();
  const isOpeningDocumentRef = useRef(false);
  const screen = useDocumentsScreen();
  const setBottomNavHidden = useUiShellStore((state) => state.setBottomNavHidden);
  const { clearSearch, documentsQuery } = screen;
  const { isLoading: isLoadingDocumentsQuery, refetch: refetchDocuments } = documentsQuery;

  useFocusEffect(
    useCallback(() => {
      if (isOpeningDocumentRef.current) {
        clearSearch();
      }
      isOpeningDocumentRef.current = false;
      if (!isLoadingDocumentsQuery) {
        void refetchDocuments();
      }
    }, [clearSearch, isLoadingDocumentsQuery, refetchDocuments]),
  );

  useEffect(() => {
    const shouldHideBottomNav = screen.isFilterSheetOpen || screen.isSortSheetOpen;

    setBottomNavHidden(shouldHideBottomNav);

    return () => setBottomNavHidden(false);
  }, [screen.isFilterSheetOpen, screen.isSortSheetOpen, setBottomNavHidden]);

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

  const renderDocumentResult = useCallback(
    ({ item: document, index }: { item: DisplayDocument; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
        <DocumentResultCard
          title={document.title}
          date={document.date}
          onChain={document.onChain}
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
          data={screen.isLoadingDocuments ? [] : screen.filteredDocuments}
          keyExtractor={(document, index) => `${document.id}-${index}`}
          renderItem={renderDocumentResult}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={screen.documentsQuery.isRefetching}
              onRefresh={() => {
                void screen.documentsQuery.refetch();
              }}
              tintColor={APP_COLORS.primary}
              colors={[APP_COLORS.primary]}
              progressBackgroundColor={APP_COLORS.white}
            />
          }
          ListHeaderComponent={
            <>
              <DocumentsHeader />

              <View style={styles.searchWrap}>
                <SearchInputWithResults
                  label="Search documents"
                  value={screen.searchQuery}
                  onChangeText={screen.setSearchQuery}
                  placeholder="Title, party, date, or keyword"
                  results={screen.filteredDocuments}
                  emptyText="No documents matched your search"
                  keyExtractor={(document, index) => `${document.id}-${index}`}
                  renderItem={renderSearchResult}
                />
              </View>

              <DocumentsFilterControls
                activeSummary={screen.activeFilterSummary}
                sortLabel={screen.sortLabel}
                onPressFilter={() => screen.setIsFilterSheetOpen(true)}
                onPressSort={() => screen.setIsSortSheetOpen(true)}
              />
            </>
          }
          ListEmptyComponent={
            screen.isLoadingDocuments ? (
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

      </View>

      <DocumentsFilterSheet
        visible={screen.isFilterSheetOpen}
        typeOptions={[...DOCUMENT_TYPE_OPTIONS]}
        statusOptions={[...DOCUMENT_STATUS_OPTIONS]}
        selectedType={screen.documentTypeFilter}
        selectedStatus={screen.documentStatusFilter}
        selectedDate={screen.documentDateFilter}
        onClose={() => screen.setIsFilterSheetOpen(false)}
        onChangeType={(value) => screen.setDocumentTypeFilter(value as DocumentTypeKey)}
        onChangeStatus={(value) =>
          screen.setDocumentStatusFilter(value as DocumentFilterStatusKey)
        }
        onChangeDate={screen.setDocumentDateFilter}
        onClear={() => {
          screen.setDocumentTypeFilter('all');
          screen.setDocumentStatusFilter('all');
          screen.setDocumentDateFilter(null);
        }}
      />

      <DocumentsSortSheet
        visible={screen.isSortSheetOpen}
        options={[...DOCUMENT_SORT_OPTIONS]}
        selectedSort={screen.sortKey}
        onClose={() => screen.setIsSortSheetOpen(false)}
        onSelectSort={(value) => screen.setSortKey(value as DocumentSortKey)}
      />
    </SafeAreaView>
  );
}
