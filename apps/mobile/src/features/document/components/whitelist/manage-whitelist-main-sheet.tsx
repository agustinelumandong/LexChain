import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Button } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';
import type {
  DocumentPartyRole,
  ManageWhitelistData,
  WhitelistGrant,
} from '@/types';

import { manageWhitelistStyles as styles, MANAGE_WHITELIST_COLORS as COLORS } from './manage-whitelist.styles';
import { ManageWhitelistGrantsSection } from './manage-whitelist-grants-section';
import { ManageWhitelistHeader } from './manage-whitelist-header';
import { ManageWhitelistTopBar } from './manage-whitelist-top-bar';
import { MOBILE_USER_ROLES } from '../../constants/manage-whitelist.constants';
import { getMobileRoleLabel } from '../../utils/manage-whitelist-labels';

type ManageWhitelistMainSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  snapPoints: string[];
  bottomInset: number;
  data: ManageWhitelistData;
  searchQuery: string;
  isLoading: boolean;
  onChangeSearchQuery: (value: string) => void;
  onClose: () => void;
  onPressAddResult?: (resultId: string, role: DocumentPartyRole) => void;
  onOpenGrantMenu: (grant: WhitelistGrant) => void;
};

export function ManageWhitelistMainSheet({
  bottomSheetRef,
  snapPoints,
  bottomInset,
  data,
  searchQuery,
  isLoading,
  onChangeSearchQuery,
  onClose,
  onPressAddResult,
  onOpenGrantMenu,
}: ManageWhitelistMainSheetProps) {
  const [inviteRole, setInviteRole] = useState<string>('owner');
  const [customInviteRoleText, setCustomInviteRoleText] = useState<string>('');
  const [isInviteRoleDropdownOpen, setIsInviteRoleDropdownOpen] = useState<boolean>(false);

  const grants = data.grants ?? [];
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchQuery.trim());

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
      containerStyle={styles.overlay}
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
          <Text style={{
            color: COLORS.navy,
            fontFamily: fonts.regular,
            fontSize: 13,
            lineHeight: 17,
            fontWeight: '800',
            marginBottom: 6
          }}>
            Invite User
          </Text>

          <View style={{ gap: 10 }}>
            <BottomSheetTextInput
              value={searchQuery}
              onChangeText={onChangeSearchQuery}
              placeholder="Enter user email"
              placeholderTextColor={COLORS.textMuted}
              style={{
                color: COLORS.navy,
                fontFamily: fonts.regular,
                fontSize: 14,
                lineHeight: 18,
                fontWeight: '600',
                backgroundColor: APP_COLORS.surfaceSoft,
                borderColor: APP_COLORS.borderSoft,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                minHeight: 48,
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 1000 }}>
              <View style={{ flex: 1, position: 'relative' }}>
                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: APP_COLORS.surfaceSoft,
                    borderColor: APP_COLORS.borderSoft,
                    borderWidth: 1,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    height: 48,
                  }}
                  onPress={() => setIsInviteRoleDropdownOpen(!isInviteRoleDropdownOpen)}
                >
                  <Text style={{
                    color: COLORS.navy,
                    fontFamily: fonts.regular,
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                    {getMobileRoleLabel(inviteRole)}
                  </Text>
                  <MaterialIcons
                    name={isInviteRoleDropdownOpen ? 'expand-less' : 'expand-more'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </Pressable>

                {isInviteRoleDropdownOpen ? (
                  <View style={{
                    position: 'absolute',
                    top: 52,
                    left: 0,
                    right: 0,
                    backgroundColor: APP_COLORS.surface,
                    borderColor: APP_COLORS.borderSoft,
                    borderWidth: 1,
                    borderRadius: 16,
                    padding: 8,
                    gap: 4,
                    shadowColor: COLORS.navy,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                    zIndex: 9999,
                  }}>
                    {MOBILE_USER_ROLES.map((role) => (
                      <Pressable
                        key={role.key}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                        }}
                        onPress={() => {
                          setInviteRole(role.key);
                          setIsInviteRoleDropdownOpen(false);
                        }}
                      >
                        <Text style={{
                          color: COLORS.navy,
                          fontFamily: fonts.regular,
                          fontSize: 14,
                          fontWeight: '600',
                        }}>{role.label}</Text>
                        {inviteRole === role.key ? (
                          <MaterialIcons name="check" size={18} color={COLORS.primary} />
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>

              <Button
                label="Invite"
                variant="primary"
                size="sm"
                style={{ height: 48, minHeight: 48, borderRadius: 16, minWidth: 80 }}
                disabled={!isEmail || (inviteRole === 'other' && !customInviteRoleText.trim())}
                onPress={() => {
                  const finalRole = inviteRole === 'other' ? (customInviteRoleText.trim() as DocumentPartyRole) : (inviteRole as DocumentPartyRole);
                  onPressAddResult?.(searchQuery.trim(), finalRole);
                  setInviteRole('owner');
                  setCustomInviteRoleText('');
                }}
              />
            </View>

            {inviteRole === 'other' ? (
              <BottomSheetTextInput
                value={customInviteRoleText}
                onChangeText={setCustomInviteRoleText}
                placeholder="Enter role (e.g. buyer, seller, broker)"
                placeholderTextColor={COLORS.textMuted}
                style={{
                  color: COLORS.navy,
                  fontFamily: fonts.regular,
                  fontSize: 14,
                  lineHeight: 18,
                  fontWeight: '600',
                  backgroundColor: APP_COLORS.surfaceSoft,
                  borderColor: APP_COLORS.borderSoft,
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  minHeight: 48,
                }}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
              />
            ) : null}
          </View>
        </View>

        <ManageWhitelistGrantsSection
          grants={grants}
          isLoading={isLoading}
          onOpenGrantMenu={onOpenGrantMenu}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
