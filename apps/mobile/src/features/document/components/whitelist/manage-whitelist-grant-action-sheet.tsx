import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { APP_COLORS, fonts } from '@/theme';
import type { WhitelistGrant } from '@/types';

import { type MobileUserRoleKey } from '../../constants/manage-whitelist.constants';
import { ManageWhitelistGrantFooter } from './manage-whitelist-grant-footer';
import { ManageWhitelistGrantHeader } from './manage-whitelist-grant-header';
import { manageWhitelistStyles as styles, MANAGE_WHITELIST_COLORS as COLORS } from './manage-whitelist.styles';

type ManageWhitelistGrantActionSheetProps = {
  grantSheetRef: React.RefObject<BottomSheet | null>;
  snapPoints: string[];
  bottomInset: number;
  selectedGrant?: WhitelistGrant;
  selectedGrantRole: MobileUserRoleKey;
  revokeCountdown: number | null;
  revokeLabel: string;
  onClose: () => void;
  onPressRevoke: () => void;
};

export function ManageWhitelistGrantActionSheet({
  grantSheetRef,
  snapPoints,
  bottomInset,
  selectedGrant,
  selectedGrantRole,
  revokeCountdown,
  revokeLabel,
  onClose,
  onPressRevoke,
}: ManageWhitelistGrantActionSheetProps) {
  const renderGrantBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      pressBehavior="close"
      style={[styles.backdrop, styles.stackedOverlay]}
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
      containerStyle={styles.stackedOverlay}
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

        <View style={{ gap: 6, paddingHorizontal: 4, marginTop: 8 }}>
          <Text style={{
            color: COLORS.navy,
            fontFamily: fonts.regular,
            fontSize: 13,
            fontWeight: '800',
            lineHeight: 17,
            marginBottom: 2
          }}>
            Role
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: APP_COLORS.surfaceSoft,
            borderColor: APP_COLORS.borderSoft,
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 16,
            height: 48,
            opacity: 0.7,
          }}>
            <Text style={{
              color: COLORS.textMuted,
              fontFamily: fonts.regular,
              fontSize: 14,
              fontWeight: '600',
            }}>
              {selectedGrant?.accessLabel ?? ''}
            </Text>
            <MaterialIcons
              name="lock"
              size={18}
              color={COLORS.textMuted}
            />
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
