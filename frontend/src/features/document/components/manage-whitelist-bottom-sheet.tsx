import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchInputWithResults, SkeletonBox } from '@/ui';
import type { DocumentPartyRole, ManageWhitelistData } from '@/types';
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
  helper: string;
}[] = [
  {
    key: 'participant',
    label: 'Witness/Participant',
    helper: 'Viewer',
  },
  {
    key: 'owner',
    label: 'Owner',
    helper: 'Viewer',
  },
  {
    key: 'lawyer',
    label: 'Lawyer',
    helper: 'Viewer, signer, or editor',
  },
];

const LAWYER_ACCESS_ROLES: {
  key: DocumentPartyRole;
  label: string;
}[] = [
  { key: 'viewer', label: 'Viewer' },
  { key: 'signer', label: 'Signer' },
  { key: 'editor', label: 'Editor' },
];

function getAddLabel(role: DocumentPartyRole) {
  return `Add ${role.charAt(0).toUpperCase()}${role.slice(1)}`;
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
  const insets = useSafeAreaInsets();
  const [selectedMobileRole, setSelectedMobileRole] =
    useState<MobileUserRoleKey>('participant');
  const [selectedAccessRole, setSelectedAccessRole] =
    useState<DocumentPartyRole>('viewer');
  const snapPoints = useMemo(() => ['90%'], []);
  const effectiveAccessRole =
    selectedMobileRole === 'lawyer' ? selectedAccessRole : 'viewer';

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

        <View style={styles.roleBlock}>
          <Text style={styles.sectionTitle}>Assign as</Text>

          <View style={styles.roleList}>
            {MOBILE_USER_ROLES.map((role) => {
              const isSelected = selectedMobileRole === role.key;

              return (
                <Pressable
                  key={role.key}
                  style={[
                    styles.roleCard,
                    isSelected && styles.roleCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedMobileRole(role.key);
                    setSelectedAccessRole('viewer');
                  }}
                >
                  <View style={styles.roleCopy}>
                    <Text
                      style={[
                        styles.roleLabel,
                        isSelected && styles.roleLabelSelected,
                      ]}
                    >
                      {role.label}
                    </Text>
                    <Text style={styles.roleHelper}>{role.helper}</Text>
                  </View>

                  <MaterialIcons
                    name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={isSelected ? COLORS.primary : COLORS.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>

          {selectedMobileRole === 'lawyer' ? (
            <View style={styles.accessRoleList}>
              {LAWYER_ACCESS_ROLES.map((role) => {
                const isSelected = selectedAccessRole === role.key;

                return (
                  <Pressable
                    key={role.key}
                    style={[
                      styles.accessRolePill,
                      isSelected && styles.accessRolePillSelected,
                    ]}
                    onPress={() => setSelectedAccessRole(role.key)}
                  >
                    <Text
                      style={[
                        styles.accessRoleLabel,
                        isSelected && styles.accessRoleLabelSelected,
                      ]}
                    >
                      {role.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
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
  roleBlock: {
    gap: 10,
  },
  sectionTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  roleList: {
    gap: 8,
  },
  roleCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F4FAFF',
  },
  roleCopy: {
    flex: 1,
    gap: 3,
  },
  roleLabel: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  roleLabelSelected: {
    color: COLORS.primary,
  },
  roleHelper: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  accessRoleList: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  accessRolePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  accessRolePillSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  accessRoleLabel: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
  },
  accessRoleLabelSelected: {
    color: COLORS.surface,
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
