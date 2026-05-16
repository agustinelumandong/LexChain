import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchInputWithResults, SkeletonBox } from '@/ui';
import type { DocumentPartyRole, ManageWhitelistData, WhitelistGrant } from '@/types';
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

type MobileUserRoleKey = 'participant' | 'owner' | 'lawyer';

const MOBILE_USER_ROLES: {
  key: MobileUserRoleKey;
  label: string;
}[] = [
  { key: 'participant', label: 'Witness/Participant' },
  { key: 'owner', label: 'Owner' },
  { key: 'lawyer', label: 'Lawyer' },
];

function getAddLabel(role: DocumentPartyRole) {
  if (role === 'viewer') {
    return 'Add Read';
  }

  return `Add ${role.charAt(0).toUpperCase()}${role.slice(1)}`;
}

function getMobileRoleLabel(role: MobileUserRoleKey) {
  if (role === 'owner') {
    return 'Owner';
  }

  if (role === 'lawyer') {
    return 'Lawyer';
  }

  return 'Witness/Participant';
}

type ManageWhitelistBottomSheetProps = {
  visible: boolean;
  data: ManageWhitelistData | null;
  searchQuery: string;
  isLoading?: boolean;
  onChangeSearchQuery: (value: string) => void;
  onClose: () => void;
  onPressGrantAction?: (grantId: string) => void;
  onPressRevoke?: (grantId: string) => void;
  onPressAddResult?: (resultId: string, role: DocumentPartyRole) => void;
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
  const grantSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const [selectedGrantId, setSelectedGrantId] = useState<string | null>(null);
  const [selectedGrantRole, setSelectedGrantRole] =
    useState<MobileUserRoleKey>('participant');
  const [isGrantRoleDropdownOpen, setIsGrantRoleDropdownOpen] = useState(false);
  const [revokeCountdown, setRevokeCountdown] = useState<number | null>(null);
  const snapPoints = useMemo(() => ['90%'], []);
  const grantSnapPoints = useMemo(() => ['38%'], []);
  const effectiveAccessRole: DocumentPartyRole = 'viewer';

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
      setSelectedGrantId(null);
      setIsGrantRoleDropdownOpen(false);
      setRevokeCountdown(null);
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedGrantId) {
        grantSheetRef.current?.dismiss();
        return true;
      }

      bottomSheetRef.current?.dismiss();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [selectedGrantId, visible]);

  useEffect(() => {
    const sheet = grantSheetRef.current;

    if (!sheet) {
      return;
    }

    if (selectedGrantId) {
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [selectedGrantId]);

  useEffect(() => {
    if (revokeCountdown === null || revokeCountdown <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setRevokeCountdown((current) =>
        current === null ? null : Math.max(0, current - 1),
      );
    }, 1000);

    return () => clearTimeout(timeout);
  }, [revokeCountdown]);

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

  const renderGrantBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.2}
      pressBehavior="close"
    />
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const grants = data?.grants ?? [];
  const searchResults = data?.searchResults ?? [];
  const filteredSearchResults =
    normalizedQuery.length > 0
      ? searchResults.filter(
          (result) =>
            result.name.toLowerCase().includes(normalizedQuery) ||
            result.email.toLowerCase().includes(normalizedQuery),
        )
      : [];
  const shouldShowSearchResults = normalizedQuery.length > 0;
  const selectedGrant = grants.find((grant) => grant.id === selectedGrantId);

  const openGrantMenu = (grant: WhitelistGrant) => {
    setSelectedGrantId(grant.id);
    setSelectedGrantRole(grant.assignedAs ?? 'participant');
    setIsGrantRoleDropdownOpen(false);
    setRevokeCountdown(null);
  };

  const closeGrantMenu = useCallback(() => {
    setSelectedGrantId(null);
    setIsGrantRoleDropdownOpen(false);
    setRevokeCountdown(null);
  }, []);

  const handlePressRevoke = useCallback(() => {
    if (!selectedGrant) {
      return;
    }

    if (revokeCountdown === null) {
      setRevokeCountdown(3);
      return;
    }

    if (revokeCountdown === 0) {
      onPressRevoke?.(selectedGrant.id);
      closeGrantMenu();
    }
  }, [closeGrantMenu, onPressRevoke, revokeCountdown, selectedGrant]);

  const revokeLabel =
    revokeCountdown === null
      ? 'Revoke'
      : revokeCountdown > 0
        ? `${revokeCountdown}...`
        : 'Confirm';

  const renderGrantFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter
        {...props}
        bottomInset={insets.bottom}
        style={styles.grantFooterContainer}
      >
        <View style={styles.grantFooter}>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.revokeButton,
              revokeCountdown !== null && revokeCountdown > 0 && styles.revokeButtonWaiting,
              revokeCountdown === 0 && styles.revokeButtonConfirm,
            ]}
            onPress={handlePressRevoke}
          >
            <Text
              style={[
                styles.revokeButtonLabel,
                revokeCountdown !== null && revokeCountdown > 0 && styles.revokeButtonLabelWaiting,
                revokeCountdown === 0 && styles.revokeButtonLabelConfirm,
              ]}
            >
              {revokeLabel}
            </Text>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [handlePressRevoke, insets.bottom, revokeCountdown, revokeLabel],
  );

  if (!data) {
    return null;
  }

  return (
    <>
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
                addLabel={getAddLabel(effectiveAccessRole)}
                roundedTop={index === 0}
                roundedBottom={index === filteredSearchResults.length - 1}
                onPressAdd={() => onPressAddResult?.(result.id, effectiveAccessRole)}
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
                    openGrantMenu(grant);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={grantSheetRef}
        index={0}
        snapPoints={grantSnapPoints}
        onDismiss={closeGrantMenu}
        enableDynamicSizing={true}
        enablePanDownToClose
        backdropComponent={renderGrantBackdrop}
        footerComponent={renderGrantFooter}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheet}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.grantActionContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grantActionHeader}>
            <Text style={styles.grantActionTitle}>{selectedGrant?.name ?? 'Access grant'}</Text>
            <Text style={styles.grantActionSubtitle}>
              {selectedGrant?.email ?? 'Manage this user access'}
            </Text>
          </View>

          <View style={styles.dropdownBlock}>
            <Text style={styles.dropdownLabel}>Assign as</Text>
            <Pressable
              style={styles.dropdownButton}
              onPress={() => setIsGrantRoleDropdownOpen((current) => !current)}
            >
              <Text style={styles.dropdownValue}>{getMobileRoleLabel(selectedGrantRole)}</Text>
              <MaterialIcons
                name={isGrantRoleDropdownOpen ? 'expand-less' : 'expand-more'}
                size={20}
                color={COLORS.textMuted}
              />
            </Pressable>

            {isGrantRoleDropdownOpen ? (
              <View style={styles.dropdownMenu}>
                {MOBILE_USER_ROLES.map((role) => (
                  <Pressable
                    key={role.key}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedGrantRole(role.key);
                      setIsGrantRoleDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemLabel}>{role.label}</Text>
                    {selectedGrantRole === role.key ? (
                      <MaterialIcons name="check" size={18} color={COLORS.primary} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
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
    backgroundColor: COLORS.borderSoft,
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
  grantActionContent: {
    paddingHorizontal: 18,
    gap: 18,
  },
  grantActionHeader: {
    gap: 6,
  },
  grantActionTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  grantActionSubtitle: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  dropdownBlock: {
    gap: 8,
  },
  dropdownLabel: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  dropdownButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownValue: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  dropdownMenu: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dropdownItem: {
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownItemLabel: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  grantFooterContainer: {
    backgroundColor: 'transparent',
  },
  grantFooter: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: COLORS.sheet,
  },
  revokeButton: {
    borderRadius: 999,
    backgroundColor: '#FFECEF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  revokeButtonWaiting: {
    backgroundColor: COLORS.borderSoft,
  },
  revokeButtonConfirm: {
    backgroundColor: '#D8627B',
  },
  revokeButtonLabel: {
    color: '#D8627B',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  revokeButtonLabelWaiting: {
    color: COLORS.textMuted,
  },
  revokeButtonLabelConfirm: {
    color: COLORS.surface,
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
