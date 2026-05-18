import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ErrorState } from '@/ui';
import { useSearchDocument } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';

import { DocumentSearchBar } from './document-search-bar';
import { SearchDocumentEmptyCard } from './search-document-empty-card';
import { SearchDocumentSheetHeader } from './search-document-sheet-header';
import { searchDocumentSheetStyles } from './search-document-sheet.styles';
import { SearchResultsCard } from './search-results-card';

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
      backgroundStyle={searchDocumentSheetStyles.sheetBackground}
      handleIndicatorStyle={searchDocumentSheetStyles.handleIndicator}
    >
      <SearchDocumentSheetHeader documentTitle={documentTitle} />

      <BottomSheetScrollView
        style={searchDocumentSheetStyles.scrollArea}
        contentContainerStyle={searchDocumentSheetStyles.scrollContent}
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

        {!hasSearched ? <SearchDocumentEmptyCard /> : null}

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
