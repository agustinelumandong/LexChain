import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

type ConfirmAnchorSheetProps = {
  documentTitle: string;
  isLoading: boolean;
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmAnchorSheet({
  documentTitle,
  isLoading,
  visible,
  onCancel,
  onConfirm,
}: ConfirmAnchorSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['44%'], []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={1}
        pressBehavior="close"
        style={styles.backdrop}
      />
    ),
    [],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter
        {...props}
        bottomInset={insets.bottom}
        style={styles.footerContainer}
      >
        <View style={styles.footer}>
          <View style={styles.actionButton}>
            <Button
              label="Cancel"
              variant="secondary"
              fullWidth
              disabled={isLoading}
              onPress={onCancel}
            />
          </View>
          <View style={styles.actionButton}>
            <Button
              label="Confirm"
              leftIconName="fingerprint"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              onPress={onConfirm}
            />
          </View>
        </View>
      </BottomSheetFooter>
    ),
    [insets.bottom, isLoading, onCancel, onConfirm],
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        containerStyle={styles.overlay}
        onClose={onCancel}
        enableDynamicSizing={false}
        enablePanDownToClose={!isLoading}
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheet}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.iconBubble}>
            <MaterialIcons name="fingerprint" size={28} color={APP_COLORS.primary} />
          </View>

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>BLOCKCHAIN ANCHOR</Text>
            <Text style={styles.title}>Confirm document anchor</Text>
            <Text style={styles.description}>
              This records the document hash on-chain. Confirm with device biometrics or passcode before continuing.
            </Text>
            <Text numberOfLines={2} style={styles.documentName}>
              {documentTitle}
            </Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
  },
  backdrop: {
    backgroundColor: 'rgba(7, 22, 43, 0.42)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: APP_COLORS.white,
  },
  handle: {
    backgroundColor: APP_COLORS.borderSoft,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 112,
    gap: 16,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: 7,
  },
  eyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
  },
  description: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  documentName: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: '#F7FBFF',
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  footerContainer: {
    backgroundColor: APP_COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.white,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
});
