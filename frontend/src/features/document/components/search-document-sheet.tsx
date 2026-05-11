import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ErrorState } from '@/ui';
import { useSearchDocument } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { APP_COLORS, fonts } from '@/theme';

import { DocumentSearchBar } from './document-search-bar';
import { SearchResultsCard } from './search-results-card';

const COLORS = {
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
};

type SearchDocumentSheetProps = {
  visible: boolean;
  documentId: string;
  documentTitle: string;
  onClose: () => void;
  onPressMatch?: (chunkId: string) => void;
};

export function SearchDocumentSheet({
  visible,
  documentId,
  documentTitle,
  onClose,
  onPressMatch,
}: SearchDocumentSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const snapPoints = useMemo(() => ['70%', '95%'], []);
  const searchMutation = useSearchDocument(
    hasSearched ? documentId : '',
    hasSearched ? searchQuery : '',
  );
  const isSearching = hasSearched && searchMutation.isFetching;

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim().length === 0) {
      return;
    }

    setHasSearched(true);
    bottomSheetRef.current?.snapToIndex(1);
  }, [searchQuery]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustPan"
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialIcons name="search" size={18} color={COLORS.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Search within document</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Keyword lookup in {documentTitle || 'this document'}
          </Text>
        </View>
      </View>

      <BottomSheetScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <DocumentSearchBar
          value={searchQuery}
          onChangeText={(value) => {
            setSearchQuery(value);
            if (!value.trim()) {
              setHasSearched(false);
            }
          }}
          onSubmit={handleSearch}
          isLoading={isSearching}
        />

        {!hasSearched ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="manage-search" size={30} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>Find exact mentions fast</Text>
            <Text style={styles.emptyBody}>
              Search names, dates, clauses, document numbers, or locations inside this document.
            </Text>
          </View>
        ) : null}

        {searchMutation.data ? (
          <SearchResultsCard
            hits={searchMutation.data.results}
            onPressHit={onPressMatch}
          />
        ) : null}

        {searchMutation.isError ? (
          <ErrorState
            title="Search failed"
            message={parseApiError(searchMutation.error).message}
            onRetry={() => {
              void searchMutation.refetch();
            }}
          />
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: COLORS.surfaceSoft,
    width: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: COLORS.sheet,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 42,
    gap: 16,
  },
  emptyCard: {
    minHeight: 220,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  emptyTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    textAlign: 'center',
  },
});
