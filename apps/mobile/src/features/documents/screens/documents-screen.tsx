import React, { useCallback, useRef } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  DocumentsFilterControls,
  DocumentsFilterSheet,
  DocumentsHeader,
  DocumentsListSkeleton,
  DocumentResultCard,
  DocumentsSortSheet,
} from '@/features/documents';
import { SearchInputWithResults, BottomNav } from '@/ui';
import { useProfileSettingsStore } from '@/features/profile';
import type { DocumentSortKey, DocumentTypeKey } from '@/types';

import {
  DOCUMENT_SORT_OPTIONS,
  DOCUMENT_STATUS_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
} from '../constants/documents-screen.constants';
import { DocumentSearchResultRow } from '../components/document-search-result-row';
import { styles } from '../documents-screen.styles';
import { useDocumentsScreen } from '../hooks/use-documents-screen';
import type {
  DisplayDocument,
  DocumentFilterStatusKey,
} from '../types/documents-screen.types';

export default function DocumentsScreen() {
  const router = useRouter();
  const account = useProfileSettingsStore((state) => state.account);
  const isOpeningDocumentRef = useRef(false);
  const screen = useDocumentsScreen();

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
          data={screen.isLoadingDocuments ? [] : screen.filteredDocuments}
          keyExtractor={(document, index) => `${document.id}-${index}`}
          renderItem={renderDocumentResult}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          refreshing={screen.documentsQuery.isRefetching}
          onRefresh={() => {
            void screen.documentsQuery.refetch();
          }}
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

        <View style={styles.navWrap}>
          <BottomNav
            activeTab="documents"
            onPressHome={() => router.push('/(tabs)')}
            onPressDocuments={() => {}}
            onPressProfile={() => router.push('/(tabs)/profile')}
            onPressUpload={() => router.push('/upload')}
            showUpload={account.role.toLowerCase() !== 'viewer'}
          />
        </View>
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
