import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchInputWithResults, SkeletonBox } from '@/ui';
import type { ManageWhitelistData } from '@/types';
import { WhitelistGrantRow } from './whitelist-grant-row';
import { WhitelistSearchResultRow } from './whitelist-search-result-row';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  surfaceSoft: APP_COLORS.bg,
};

type ManageWhitelistBottomSheetProps = {
  visible: boolean;
  data: ManageWhitelistData | null;
  searchQuery: string;
  isLoading?: boolean;
  onChangeSearchQuery: (value: string) => void;
  onClose: () => void;
  onPressGrantAction?: (grantId: string) => void;
  onPressRevoke?: (grantId: string) => void;
  onPressAddResult?: (resultId: string) => void;
};

export function ManageWhitelistBottomSheet({
  visible,
  data,
  searchQuery,
  isLoading = false,
  onChangeSearchQuery,
  onClose,
  onPressGrantAction,
  onPressRevoke,
  onPressAddResult,
}: ManageWhitelistBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['90%'], []);

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible && data) {
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [data, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      bottomSheetRef.current?.dismiss();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [visible]);

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

  if (!data) {
    return null;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSearchResults =
    normalizedQuery.length > 0
      ? data.searchResults.filter(
          (result) =>
            result.name.toLowerCase().includes(normalizedQuery) ||
            result.email.toLowerCase().includes(normalizedQuery),
        )
      : [];
  const shouldShowSearchResults = normalizedQuery.length > 0;

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
          { paddingBottom: Math.max(insets.bottom, 24) },
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
                roundedTop={index === 0}
                roundedBottom={index === filteredSearchResults.length - 1}
                onPressAdd={() => onPressAddResult?.(result.id)}
              />
            )}
          />
        </View>

        <View style={styles.grantsBlock}>
          <Text style={styles.grantsTitle}>Current grants</Text>

          {isLoading && data.grants.length === 0 ? (
            <View style={styles.skeletonList}>
              <SkeletonBox height={52} borderRadius={16} />
              <SkeletonBox height={52} borderRadius={16} />
              <SkeletonBox height={52} borderRadius={16} />
            </View>
          ) : data.grants.length === 0 ? (
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
              {data.grants.map((grant) => (
                <WhitelistGrantRow
                  key={grant.id}
                  name={grant.name}
                  accessLabel={grant.accessLabel}
                  actionLabel={grant.actionLabel}
                  onPressAction={() => onPressGrantAction?.(grant.id)}
                  onPressRevoke={() => onPressRevoke?.(grant.id)}
                />
              ))}
            </View>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.sheet,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#B9D9FF',
    marginTop: 10,
    marginBottom: 8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    gap: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  leftAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarLabel: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  headerBlock: {
    gap: 12,
  },
  eyebrow: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '800',
  },
  description: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  searchBlock: {
    position: 'relative',
    gap: 8,
    zIndex: 10,
  },
  grantsBlock: {
    gap: 10,
  },
  grantsTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  grantsList: {
    gap: 10,
  },
  skeletonList: {
    gap: 10,
  },
  stateCard: {
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 6,
  },
  stateTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  stateBody: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  emptyStateCard: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 12,
  },

  emptyStateIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyStateTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyStateBody: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    textAlign: 'center',
  },

  emptyStateHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  emptyStateHintText: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
});
