import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DocumentPreviewBottomSheet,
} from '@/features/document/components/document-preview-bottom-sheet';
import {
  ManageWhitelistBottomSheet,
} from '@/features/document/components/manage-whitelist-bottom-sheet';
import {
  VerifyDocumentBottomSheet,
} from '@/features/document/components/verify-document-bottom-sheet';
import { DocumentsFilterControls } from '@/features/documents/documents-filter-controls';
import { DocumentsFilterSheet } from '@/features/documents/documents-filter-sheet';
import { DocumentsHeader } from '@/features/documents/documents-header';
import { DocumentResultCard } from '@/features/documents/document-result-card';
import { DocumentsSortSheet } from '@/features/documents/documents-sort-sheet';
import {
  MOCK_DOCUMENTS,
  type MockDocument,
  type DocumentSortKey,
  type DocumentStatusKey,
  type DocumentTypeKey,
} from '@/features/documents/mock-documents';
import { SearchInputWithResults } from '@/shared/components/ui/search-input-with-results';
import {
  applyWhitelistToDocument,
  hydrateDocumentsWithPersistedWhitelists,
  persistDocumentWhitelist,
} from '@/features/document/services/whitelist-storage';
import { useCloseSheetOnBack } from '@/shared/hooks/use-close-sheet-on-back';
import { BottomNav } from '@/shared/components/ui/bottom-nav';

const COLORS = {
  bg: '#F3F8FF',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surface: '#FFFFFF',
};

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
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<DocumentTypeKey>('all');
  const [documentStatusFilter, setDocumentStatusFilter] = useState<DocumentStatusKey>('all');
  const [documentDateFilter, setDocumentDateFilter] = useState<Date | null>(null);
  const [sortKey, setSortKey] = useState<DocumentSortKey>('newest');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isWhitelistOpen, setIsWhitelistOpen] = useState(false);
  const [isWhitelistLoading, setIsWhitelistLoading] = useState(false);
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

  useEffect(() => {
    let isMounted = true;

    const loadPersistedWhitelists = async () => {
      setIsWhitelistLoading(true);

      try {
        const hydratedDocuments = await hydrateDocumentsWithPersistedWhitelists(MOCK_DOCUMENTS);

        if (isMounted) {
          setDocuments(hydratedDocuments);
        }
      } catch (error) {
        console.error('Failed to hydrate persisted document whitelists.', error);
      } finally {
        if (isMounted) {
          setIsWhitelistLoading(false);
        }
      }
    };

    loadPersistedWhitelists();

    return () => {
      isMounted = false;
    };
  }, []);

  useCloseSheetOnBack(isAnySheetOpen, () => {
    setIsPreviewOpen(false);
    setIsVerifyOpen(false);
    setIsWhitelistOpen(false);
    setIsFilterSheetOpen(false);
    setIsSortSheetOpen(false);
    setWhitelistSearchQuery('');
  });

  const openPreview = (documentId: string) => {
    const nextDocument = documents.find((document) => document.id === documentId) ?? null;

    if (!nextDocument) {
      return;
    }

    setSelectedDocumentId(nextDocument.id);
    setIsVerifyOpen(false);
    setIsPreviewOpen(true);
  };

  const openVerify = (documentId: string) => {
    const nextDocument = documents.find((document) => document.id === documentId) ?? null;

    if (!nextDocument) {
      return;
    }

    setSelectedDocumentId(nextDocument.id);
    setIsPreviewOpen(false);
    setIsVerifyOpen(true);
  };

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

  const updateDocumentWhitelist = (
    documentId: string,
    updater: (document: (typeof documents)[number]) => (typeof documents)[number],
  ) => {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId ? updater(document) : document,
      ),
    );
  };

  const handleAddWhitelistResult = async (resultId: string) => {
    if (!selectedDocument) return;

    const result = selectedDocument.whitelist.searchResults.find((entry) => entry.id === resultId);

    if (!result) return;

    const nextWhitelist = {
      ...selectedDocument.whitelist,
      grants: [
        {
          id: result.id,
          name: result.name,
          email: result.email,
          accessLabel: 'View access',
          actionLabel: 'View',
        },
        ...selectedDocument.whitelist.grants,
      ],
      searchResults: selectedDocument.whitelist.searchResults.filter(
        (entry) => entry.id !== resultId,
      ),
    };

    updateDocumentWhitelist(selectedDocument.id, (document) =>
      applyWhitelistToDocument(document, nextWhitelist),
    );

    setWhitelistSearchQuery('');
    setIsWhitelistLoading(true);

    try {
      await persistDocumentWhitelist(selectedDocument.id, {
        grants: nextWhitelist.grants,
        searchResults: nextWhitelist.searchResults,
      });
    } catch (error) {
      console.error('Failed to persist added whitelist entry.', error);
    } finally {
      setIsWhitelistLoading(false);
    }
  };

  const handleRevokeGrant = async (grantId: string) => {
    if (!selectedDocument) {
      return;
    }

    const grant = selectedDocument.whitelist.grants.find((entry) => entry.id === grantId);

    if (!grant) {
      return;
    }

    const nextWhitelist = {
      ...selectedDocument.whitelist,
      grants: selectedDocument.whitelist.grants.filter((entry) => entry.id !== grantId),
      searchResults:
        grant.email &&
        !selectedDocument.whitelist.searchResults.some((entry) => entry.id === grant.id)
          ? [
              {
                id: grant.id,
                name: grant.name,
                email: grant.email,
              },
              ...selectedDocument.whitelist.searchResults,
            ]
          : selectedDocument.whitelist.searchResults,
    };

    updateDocumentWhitelist(selectedDocument.id, (document) =>
      applyWhitelistToDocument(document, nextWhitelist),
    );

    setIsWhitelistLoading(true);

    try {
      await persistDocumentWhitelist(selectedDocument.id, {
        grants: nextWhitelist.grants,
        searchResults: nextWhitelist.searchResults,
      });
    } catch (error) {
      console.error('Failed to persist revoked whitelist entry.', error);
    } finally {
      setIsWhitelistLoading(false);
    }
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

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DocumentsHeader />

          <View style={styles.searchWrap}>
            <SearchInputWithResults
              label="Search documents"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Title, party, date, or keyword"
              showDropdown={false}
              results={filteredDocuments}
              emptyText="No document found"
              keyExtractor={(document) => document.id}
              renderItem={(document) => (
                <DocumentSearchResultRow
                  title={document.title}
                  parties={document.parties}
                  date={document.date}
                  onPress={() => openPreview(document.id)}
                />
              )}
            />
          </View>

          <DocumentsFilterControls
            activeSummary={activeFilterSummary}
            sortLabel={sortLabel}
            onPressFilter={() => setIsFilterSheetOpen(true)}
            onPressSort={() => setIsSortSheetOpen(true)}
          />

          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <DocumentResultCard
                key={document.id}
                title={document.title}
                parties={document.parties}
                date={document.date}
                onPressCard={() => openPreview(document.id)}
                onPressOpen={() => openPreview(document.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No documents found</Text>
              <Text style={styles.emptyBody}>
                Try another title, party name, or date.
              </Text>
            </View>
          )}
        </ScrollView>

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
    <Pressable style={styles.resultRow} onPress={onPress}>
      <View style={styles.resultCopy}>
        <Text style={styles.resultTitle}>{title}</Text>
        <Text style={styles.resultMeta}>{parties}</Text>
      </View>
      <Text style={styles.resultDate}>{date}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  searchWrap: {
    zIndex: 20,
  },
  resultRow: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#D7EBFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultCopy: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  resultMeta: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  resultDate: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  emptyState: {
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'none',
  },
  emptyTitle: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  emptyBody: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  navWrap: {
    width: '100%',
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
});
