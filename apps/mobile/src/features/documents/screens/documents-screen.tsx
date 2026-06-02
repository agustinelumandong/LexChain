import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SearchInputWithResults } from '@/ui';
import type { DocumentSortKey } from '@/types';
import { DocumentResultCard } from '@/features/documents/components/list/document-result-card';
import { DocumentsFilterControls } from '@/features/documents/components/filter/documents-filter-controls';
import { DocumentsFilterSheet } from '@/features/documents/components/filter/documents-filter-sheet';
import { DocumentsHeader } from '@/features/documents/components/list/documents-header';
import { DocumentsHeaderActionsSheet } from '@/features/documents/components/list/documents-header-actions-sheet';
import { DocumentsListSkeleton } from '@/features/documents/components/list/documents-list-skeleton';
import { DocumentsSortSheet } from '@/features/documents/components/sort/documents-sort-sheet';
import {
  DOCUMENT_SORT_OPTIONS,
  DOCUMENT_STATUS_OPTIONS,
} from '@/features/documents/constants/documents-screen.constants';
import { styles } from '@/features/documents/components/list/documents-screen.styles';
import { useDocumentsScreen } from '@/features/documents/hooks/use-documents-screen';
import { APP_COLORS } from '@/theme';
import { useUiShellStore } from '@/shared/stores/ui-shell-store';
import { canRoleUploadDocuments } from '@/features/profile';
import { usePendingDocumentInvitations, useUserProfile } from '@/services/query';
import type {
  DisplayDocument,
  DocumentFilterStatusKey,
} from '@/features/documents/types/documents-screen.types';
import type { DocumentsHeaderAction } from '@/features/documents/components/list/documents-header';

export default function DocumentsScreen() {
  const router = useRouter();
  const isOpeningDocumentRef = useRef(false);
  const [isActionsSheetVisible, setIsActionsSheetVisible] = useState(false);
  const screen = useDocumentsScreen();
  const userProfileQuery = useUserProfile();
  const userRole = userProfileQuery.data?.role?.trim().toLowerCase();
  const canViewInvitations = userRole === 'user';
  const invitationsQuery = usePendingDocumentInvitations(canViewInvitations);
  const canManageBooks = canRoleUploadDocuments(userProfileQuery.data?.role);
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
    const shouldHideBottomNav =
      screen.isFilterSheetOpen || screen.isSortSheetOpen || isActionsSheetVisible;

    setBottomNavHidden(shouldHideBottomNav);

    return () => setBottomNavHidden(false);
  }, [
    isActionsSheetVisible,
    screen.isFilterSheetOpen,
    screen.isSortSheetOpen,
    setBottomNavHidden,
  ]);

  const headerActions = useMemo<DocumentsHeaderAction[]>(() => {
    if (canManageBooks) {
      return [
        {
          label: 'Register books',
          iconName: 'library-books',
          onPress: () => router.push('/books'),
        },
        {
          label: 'Document requests',
          iconName: 'request-page',
          onPress: () => router.push('/requests'),
        },
      ];
    }

    const actions: DocumentsHeaderAction[] = [
      {
        label: 'My e-copy requests',
        iconName: 'request-page',
        onPress: () => router.push('/requests/my'),
      },
    ];

    if (canViewInvitations) {
      actions.push({
        label: 'Pending invitations',
        iconName: 'mail-outline',
        badgeCount: invitationsQuery.data?.length ?? 0,
        onPress: () => router.push('/invitations'),
      });
    }

    return actions;
  }, [canManageBooks, canViewInvitations, invitationsQuery.data?.length, router]);

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
          documentNumber={document.documentNumber}
          bookNumber={document.bookNumber}
          pageNumber={document.pageNumber}
          series={document.series}
          onChain={document.onChain}
          onPressCard={() => openDocument(document.id)}
          onPressOpen={() => openDocument(document.id)}
        />
      </Animated.View>
    ),
    [openDocument],
  );

  const renderHiddenSearchResult = useCallback(() => null, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <FlatList
          data={screen.isLoadingDocuments ? [] : screen.filteredDocuments}
          keyExtractor={(document) => document.id}
          renderItem={renderDocumentResult}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={screen.isRefreshingDocuments}
              onRefresh={() => {
                void screen.refetchVisibleDocuments();
              }}
              tintColor={APP_COLORS.primary}
              colors={[APP_COLORS.primary]}
              progressBackgroundColor={APP_COLORS.white}
            />
          }
          ListHeaderComponent={
            <>
              <DocumentsHeader
                actions={headerActions}
                onPressActions={() => setIsActionsSheetVisible(true)}
              />

              <View style={styles.searchWrap}>
                <SearchInputWithResults
                  label="Search documents"
                  value={screen.searchQuery}
                  onChangeText={screen.setSearchQuery}
                  placeholder="Title, party, date, or keyword"
                  results={screen.filteredDocuments}
                  emptyText="No documents matched your search"
                  keyExtractor={(document) => document.id}
                  renderItem={renderHiddenSearchResult}
                />
              </View>

              {!screen.isBackendSearchActive ? (
                <DocumentsFilterControls
                  activeSummary={screen.activeFilterSummary}
                  sortLabel={screen.sortLabel}
                  onPressFilter={() => screen.setIsFilterSheetOpen(true)}
                  onPressSort={() => screen.setIsSortSheetOpen(true)}
                />
              ) : null}
            </>
          }
          ListEmptyComponent={
            screen.isLoadingDocuments ? (
              <DocumentsListSkeleton />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  {screen.isBackendSearchActive
                    ? 'No semantic matches found'
                    : 'No documents found'}
                </Text>
                <Text style={styles.emptyBody}>
                  {screen.isBackendSearchActive
                    ? 'Try another party, phrase, or keyword.'
                    : 'Try another title, party name, or date.'}
                </Text>
              </View>
            )
          }
        />

      </View>

      <DocumentsFilterSheet
        visible={screen.isFilterSheetOpen}
        statusOptions={[...DOCUMENT_STATUS_OPTIONS]}
        selectedStatus={screen.documentStatusFilter}
        selectedDate={screen.documentDateFilter}
        onClose={() => screen.setIsFilterSheetOpen(false)}
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

      <DocumentsHeaderActionsSheet
        visible={isActionsSheetVisible}
        actions={headerActions}
        onClose={() => setIsActionsSheetVisible(false)}
      />
    </SafeAreaView>
  );
}
