import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { WhitelistGrant } from '@/types';

import { MOBILE_USER_ROLES, type MobileUserRoleKey } from '../constants/manage-whitelist.constants';
import { getMobileRoleLabel } from '../utils/manage-whitelist-labels';
import {
  MANAGE_WHITELIST_COLORS as COLORS,
  manageWhitelistStyles as styles,
} from './manage-whitelist.styles';

type ManageWhitelistGrantActionSheetProps = {
  grantSheetRef: React.RefObject<BottomSheetModal | null>;
  snapPoints: string[];
  bottomInset: number;
  selectedGrant?: WhitelistGrant;
  selectedGrantRole: MobileUserRoleKey;
  isGrantRoleDropdownOpen: boolean;
  revokeCountdown: number | null;
  revokeLabel: string;
  onClose: () => void;
  onPressRevoke: () => void;
  onToggleRoleDropdown: () => void;
  onSelectGrantRole: (role: MobileUserRoleKey) => void;
};

export function ManageWhitelistGrantActionSheet({
  grantSheetRef,
  snapPoints,
  bottomInset,
  selectedGrant,
  selectedGrantRole,
  isGrantRoleDropdownOpen,
  revokeCountdown,
  revokeLabel,
  onClose,
  onPressRevoke,
  onToggleRoleDropdown,
  onSelectGrantRole,
}: ManageWhitelistGrantActionSheetProps) {
  const renderGrantBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.2}
      pressBehavior="close"
    />
  );

  const renderGrantFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter
        {...props}
        bottomInset={bottomInset}
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
            onPress={onPressRevoke}
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
    [bottomInset, onPressRevoke, revokeCountdown, revokeLabel],
  );

  return (
    <BottomSheetModal
      ref={grantSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
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
          { paddingBottom: Math.max(bottomInset, 24) + 100 },
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
          <Pressable style={styles.dropdownButton} onPress={onToggleRoleDropdown}>
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
                  onPress={() => onSelectGrantRole(role.key)}
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
  );
}
