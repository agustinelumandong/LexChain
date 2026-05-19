import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import React, { useCallback } from 'react';

import type { WhitelistGrant } from '@/types';

import { type MobileUserRoleKey } from '../../constants/manage-whitelist.constants';
import { ManageWhitelistGrantFooter } from './manage-whitelist-grant-footer';
import { ManageWhitelistGrantHeader } from './manage-whitelist-grant-header';
import { ManageWhitelistRoleDropdown } from './manage-whitelist-role-dropdown';
import { manageWhitelistStyles as styles } from './manage-whitelist.styles';

type ManageWhitelistGrantActionSheetProps = {
  grantSheetRef: React.RefObject<BottomSheet | null>;
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
      <ManageWhitelistGrantFooter
        bottomInset={bottomInset}
        footerProps={props}
        revokeCountdown={revokeCountdown}
        revokeLabel={revokeLabel}
        onPressRevoke={onPressRevoke}
      />
    ),
    [bottomInset, onPressRevoke, revokeCountdown, revokeLabel],
  );

  return (
    <BottomSheet
      ref={grantSheetRef}
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
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
        <ManageWhitelistGrantHeader selectedGrant={selectedGrant} />

        <ManageWhitelistRoleDropdown
          isOpen={isGrantRoleDropdownOpen}
          selectedRole={selectedGrantRole}
          onSelectRole={onSelectGrantRole}
          onToggle={onToggleRoleDropdown}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
