import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { SearchInputWithResults, SkeletonBox } from '@/ui';
import type {
  DocumentPartyRole,
  ManageWhitelistData,
  WhitelistGrant,
  WhitelistSearchResult,
} from '@/types';

import {
  MANAGE_WHITELIST_COLORS as COLORS,
  manageWhitelistStyles as styles,
} from './manage-whitelist.styles';
import { WhitelistGrantRow } from './whitelist-grant-row';
import { WhitelistSearchResultRow } from './whitelist-search-result-row';
import { getWhitelistAddLabel } from '../utils/manage-whitelist-labels';

type ManageWhitelistMainSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
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
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
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
        <View style={styles.topBar}>
          <Pressable style={styles.leftAction} onPress={() => bottomSheetRef.current?.dismiss()}>
            <MaterialIcons name="chevron-left" size={20} color={COLORS.navy} />
            <Text style={styles.topBarLabel}>Access</Text>
          </Pressable>

          <MaterialIcons name="groups" size={18} color={COLORS.textMuted} />
        </View>

        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>WHITELIST ACCESS</Text>
          <Text style={styles.title}>Manage access</Text>
          <Text style={styles.description}>Grant or revoke document access.</Text>
        </View>

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

        <View style={styles.grantsBlock}>
          <Text style={styles.grantsTitle}>Current grants</Text>

          {isLoading && grants.length === 0 ? (
            <View style={styles.skeletonList}>
              <SkeletonBox height={52} borderRadius={16} />
              <SkeletonBox height={52} borderRadius={16} />
              <SkeletonBox height={52} borderRadius={16} />
            </View>
          ) : grants.length === 0 ? (
            <View style={styles.stateCard}>
              <View style={styles.emptyStateCard}>
                <MaterialIcons name="shield" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.stateTitle}>No access granted yet</Text>
              <Text style={styles.stateBody}>
                Search for a wallet or user above to add the first whitelist entry.
              </Text>
              <View style={styles.emptyStateHint}>
                <MaterialIcons name="person-add-alt-1" size={14} color={COLORS.primary} />
                <Text style={styles.emptyStateHintText}>Search above to grant first access</Text>
              </View>
            </View>
          ) : (
            <View style={styles.grantsList}>
              {grants.map((grant) => (
                <WhitelistGrantRow
                  key={grant.id}
                  name={grant.name}
                  accessLabel={grant.accessLabel}
                  onPressMenu={() => {
                    onPressGrantAction?.(grant.id);
                    onOpenGrantMenu(grant);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
