import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React from 'react';
import { View } from 'react-native';

import { SearchInputWithResults } from '@/ui';
import type {
  DocumentPartyRole,
  ManageWhitelistData,
  WhitelistGrant,
  WhitelistSearchResult,
} from '@/types';

import { manageWhitelistStyles as styles } from './manage-whitelist.styles';
import { ManageWhitelistGrantsSection } from './manage-whitelist-grants-section';
import { ManageWhitelistHeader } from './manage-whitelist-header';
import { ManageWhitelistTopBar } from './manage-whitelist-top-bar';
import { WhitelistSearchResultRow } from './whitelist-search-result-row';
import { getWhitelistAddLabel } from '../../utils/manage-whitelist-labels';

type ManageWhitelistMainSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  snapPoints: string[];
  bottomInset: number;
  data: ManageWhitelistData;
  searchQuery: string;
  filteredSearchResults: WhitelistSearchResult[];
  shouldShowSearchResults: boolean;
  isLoading: boolean;
  onChangeSearchQuery: (value: string) => void;
  onClose: () => void;
  onPressGrantAction?: (grantId: string) => void;
  onPressAddResult?: (resultId: string, role: DocumentPartyRole) => void;
  onOpenGrantMenu: (grant: WhitelistGrant) => void;
};

const EFFECTIVE_ACCESS_ROLE: DocumentPartyRole = 'viewer';

export function ManageWhitelistMainSheet({
  bottomSheetRef,
  snapPoints,
  bottomInset,
  data,
  searchQuery,
  filteredSearchResults,
  shouldShowSearchResults,
  isLoading,
  onChangeSearchQuery,
  onClose,
  onPressGrantAction,
  onPressAddResult,
  onOpenGrantMenu,
}: ManageWhitelistMainSheetProps) {
  const grants = data.grants ?? [];

  const renderBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      pressBehavior="close"
      style={styles.backdrop}
    />
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheet}
    >
      <BottomSheetScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(bottomInset, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ManageWhitelistTopBar onBack={() => bottomSheetRef.current?.close()} />

        <ManageWhitelistHeader />

        <View style={styles.searchBlock}>
          <SearchInputWithResults
            label={data.searchLabel ?? 'Search user'}
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            placeholder={data.searchPlaceholder ?? 'Search name or email'}
            inputMode="bottom-sheet"
            results={filteredSearchResults}
            showResults={shouldShowSearchResults}
            emptyText="No user found"
            keyExtractor={(result) => result.id}
            renderItem={(result, index) => (
              <WhitelistSearchResultRow
                name={result.name}
                email={result.email}
                addLabel={getWhitelistAddLabel(EFFECTIVE_ACCESS_ROLE)}
                roundedTop={index === 0}
                roundedBottom={index === filteredSearchResults.length - 1}
                onPressAdd={() => onPressAddResult?.(result.id, EFFECTIVE_ACCESS_ROLE)}
              />
            )}
          />
        </View>

        <ManageWhitelistGrantsSection
          grants={grants}
          isLoading={isLoading}
          onOpenGrantMenu={onOpenGrantMenu}
          onPressGrantAction={onPressGrantAction}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
