import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  DocumentPreviewBottomSheet,
  ManageWhitelistBottomSheet,
  VerifyDocumentBottomSheet,
} from '@/features/document';
import {
  DocumentsFilterControls,
  DocumentsFilterSheet,
  DocumentsHeader,
  DocumentsListSkeleton,
  DocumentResultCard,
  DocumentsSortSheet,
  useDocumentsStore,
} from '@/features/documents';
import type {
  DocumentSortKey,
  DocumentStatusKey,
  DocumentTypeKey,
  MockDocument,
} from '@/types';
import { SearchInputWithResults, BottomNav } from '@/ui';
import { useCloseSheetOnBack } from '@/hooks';
import { toast } from 'sonner-native';

import { styles } from './documents.styles';

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

export default function DocumentsScreen() {
  const router = useRouter();
  const documents = useDocumentsStore((state) => state.documents);
  const isHydratingDocuments = useDocumentsStore((state) => state.isHydrating);
  const isPersistingDocuments = useDocumentsStore((state) => state.isPersisting);
  const hydrationError = useDocumentsStore((state) => state.hydrationError);
  const addWhitelistResult = useDocumentsStore((state) => state.addWhitelistResult);
  const revokeWhitelistGrant = useDocumentsStore((state) => state.revokeWhitelistGrant);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<DocumentTypeKey>('all');
  const [documentStatusFilter, setDocumentStatusFilter] = useState<DocumentStatusKey>('all');
  const [documentDateFilter, setDocumentDateFilter] = useState<Date | null>(null);
  const [sortKey, setSortKey] = useState<DocumentSortKey>('newest');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isWhitelistOpen, setIsWhitelistOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [whitelistSearchQuery, setWhitelistSearchQuery] = useState('');
  const selectedDocument = documents.find((document) => document.id === selectedDocumentId) ?? null;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const extractContentText = (document: MockDocument) =>
    [
      document.preview.summary,
      ...document.preview.sections.flatMap((section) => {
        if ('body' in section && section.body) {
          return [section.title, section.body];
        }

        return [
          section.title,
          ...((section.rows ?? []).flatMap((row) => [row.label, row.value])),
        ];
      }),
    ]
      .join(' ')
      .toLowerCase();

  const matchesStructuredFilters = (document: MockDocument) => {
    if (documentTypeFilter !== 'all' && document.documentType !== documentTypeFilter) {
      return false;
    }

    if (documentStatusFilter !== 'all' && document.status !== documentStatusFilter) {
      return false;
    }

    if (documentDateFilter) {
      const documentDate = new Date(`${document.date}T00:00:00`);

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

  const matchesSearch = (document: MockDocument) => {
    if (normalizedSearchQuery.length === 0) {
      return true;
    }

    return [
      document.title,
      document.parties,
      document.date,
      document.preview.summary,
      extractContentText(document),
    ].some((field) => field.toLowerCase().includes(normalizedSearchQuery));
  };

  const sortDocuments = (items: typeof documents) => {
    if (sortKey === 'newest') {
      return [...items].sort((left, right) => right.date.localeCompare(left.date));
    }

    if (sortKey === 'oldest') {
      return [...items].sort((left, right) => left.date.localeCompare(right.date));
    }

    if (sortKey === 'title-az') {
      return [...items].sort((left, right) => left.title.localeCompare(right.title));
    }

    return items;
  };

  const filteredDocuments = sortDocuments(
    documents.filter((document) => matchesStructuredFilters(document) && matchesSearch(document)),
  );
  const isAnySheetOpen =
    isPreviewOpen || isVerifyOpen || isWhitelistOpen || isFilterSheetOpen || isSortSheetOpen;
  const isWhitelistLoading = isHydratingDocuments || isPersistingDocuments;

  useEffect(() => {
    if (hydrationError) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error(hydrationError);
    }
  }, [hydrationError]);

  useCloseSheetOnBack(isAnySheetOpen, () => {
    setIsPreviewOpen(false);
    setIsVerifyOpen(false);
    setIsWhitelistOpen(false);
    setIsFilterSheetOpen(false);
    setIsSortSheetOpen(false);
    setWhitelistSearchQuery('');
  });

  const openPreview = useCallback(
    (documentId: string) => {
      const nextDocument = documents.find((document) => document.id === documentId) ?? null;

      if (!nextDocument) {
        return;
      }

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDocumentId(nextDocument.id);
      setIsVerifyOpen(false);
      setIsPreviewOpen(true);
    },
    [documents],
  );

  const openVerify = useCallback(
    (documentId: string) => {
      const nextDocument = documents.find((document) => document.id === documentId) ?? null;

      if (!nextDocument) {
        return;
      }

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDocumentId(nextDocument.id);
      setIsPreviewOpen(false);
      setIsVerifyOpen(true);
    },
    [documents],
  );

  const handleVerifyFromPreview = () => {
    setIsPreviewOpen(false);

    setTimeout(() => {
      setIsVerifyOpen(true);
    }, 180);
  };

  const openWhitelist = () => {
    setIsPreviewOpen(false);

    setTimeout(() => {
      setIsWhitelistOpen(true);
    }, 180);
  };

  const handleAddWhitelistResult = (resultId: string) => {
    if (!selectedDocument) return;

    if (addWhitelistResult(selectedDocument.id, resultId)) {
      setWhitelistSearchQuery('');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Access granted');
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    toast.error('Failed to save granted access');
  };

  const handleRevokeGrant = (grantId: string) => {
    if (!selectedDocument) {
      return;
    }

    if (revokeWhitelistGrant(selectedDocument.id, grantId)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Access revoked');
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    toast.error('Failed to revoke access');
  };

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
    ({ item: document, index }: { item: MockDocument; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
        <DocumentResultCard
          title={document.title}
          parties={document.parties}
          date={document.date}
          onPressCard={() => openPreview(document.id)}
          onPressOpen={() => openPreview(document.id)}
        />
      </Animated.View>
    ),
    [openPreview],
  );

  const renderSearchResult = useCallback(
    (document: MockDocument) => (
      <DocumentSearchResultRow
        title={document.title}
        parties={document.parties}
        date={document.date}
        onPress={() => openPreview(document.id)}
      />
    ),
    [openPreview],
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <FlatList
          data={isHydratingDocuments ? [] : filteredDocuments}
          keyExtractor={(document) => document.id}
          renderItem={renderDocumentResult}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <DocumentsHeader />

              <View style={styles.searchWrap}>
                <SearchInputWithResults
                  label="Search documents"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Title, party, date, or keyword"
                  showDropdown={false}
                  results={filteredDocuments}
                  emptyText="No documents matched your search"
                  keyExtractor={(document) => document.id}
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
            isHydratingDocuments ? (
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

      <DocumentPreviewBottomSheet
        visible={isPreviewOpen}
        document={selectedDocument?.preview ?? null}
        onClose={() => setIsPreviewOpen(false)}
        onVerify={handleVerifyFromPreview}
        onManageWhitelist={openWhitelist}
        onAddWhitelist={openWhitelist}
      />

      <VerifyDocumentBottomSheet
        visible={isVerifyOpen}
        document={selectedDocument?.verify ?? null}
        onClose={() => setIsVerifyOpen(false)}
        onBackToDetails={() => {
          setIsVerifyOpen(false);

          setTimeout(() => {
            setIsPreviewOpen(true);
          }, 180);
        }}
      />

      <ManageWhitelistBottomSheet
        visible={isWhitelistOpen}
        data={selectedDocument?.whitelist ?? null}
        searchQuery={whitelistSearchQuery}
        isLoading={isWhitelistLoading}
        onChangeSearchQuery={setWhitelistSearchQuery}
        onClose={() => {
          setIsWhitelistOpen(false);
          setWhitelistSearchQuery('');
        }}
        onPressGrantAction={(grantId) => {
          if (!selectedDocument) {
            return;
          }

          const selectedGrant = selectedDocument.whitelist.grants.find(
            (grant) => grant.id === grantId,
          );

          setIsWhitelistOpen(false);

          setTimeout(() => {
            if (selectedGrant?.actionLabel === 'Verify') {
              openVerify(selectedDocument.id);
              return;
            }

            openPreview(selectedDocument.id);
          }, 180);
        }}
        onPressRevoke={handleRevokeGrant}
        onPressAddResult={handleAddWhitelistResult}
      />

      <DocumentsFilterSheet
        visible={isFilterSheetOpen}
        typeOptions={[...DOCUMENT_TYPE_OPTIONS]}
        statusOptions={[...DOCUMENT_STATUS_OPTIONS]}
        selectedType={documentTypeFilter}
        selectedStatus={documentStatusFilter}
        selectedDate={documentDateFilter}
        onClose={() => setIsFilterSheetOpen(false)}
        onChangeType={(value) => setDocumentTypeFilter(value as DocumentTypeKey)}
        onChangeStatus={(value) => setDocumentStatusFilter(value as DocumentStatusKey)}
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
  parties: string;
  date: string;
  onPress: () => void;
};

function DocumentSearchResultRow({
  title,
  parties,
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
        <Text style={styles.resultMeta}>{parties}</Text>
      </View>
      <Text style={styles.resultDate}>{date}</Text>
    </Pressable>
  );
}
