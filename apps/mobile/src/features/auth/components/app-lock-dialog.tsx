import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/ui/button';
import { APP_COLORS, fonts } from '@/theme';

export type AppLockDialogRef = {
  show: () => Promise<boolean>;
};

export const appLockDialogRef = React.createRef<AppLockDialogRef>();

export function AppLockDialog() {
  const sheetRef = useRef<BottomSheet>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setVisible(true);
    });
  }, []);

  const handleResponse = useCallback((enabled: boolean) => {
    sheetRef.current?.close();
    setVisible(false);
    resolveRef.current?.(enabled);
    resolveRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  useImperativeHandle(appLockDialogRef, () => ({ show }), [show]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="none"
      />
    ),
    [],
  );

  if (!visible) {
    return null;
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      enableDynamicSizing
      enablePanDownToClose={false}
      backdropComponent={renderBackdrop}
      onClose={handleClose}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.iconRow}>
          <MaterialIcons name="fingerprint" size={28} color={APP_COLORS.primary} />
        </View>

        <Text style={styles.title}>Enable App Lock?</Text>
        <Text style={styles.body}>
          Use your phone unlock method to protect LexChain on this device.
        </Text>

        <View style={styles.actions}>
          <Button
            label="Enable"
            fullWidth
            onPress={() => handleResponse(true)}
            leftIconName="fingerprint"
          />
          <Button
            label="Not now"
            variant="ghost"
            fullWidth
            onPress={() => handleResponse(false)}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: APP_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  indicator: {
    backgroundColor: APP_COLORS.borderSoft,
    width: 36,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  iconRow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(22, 137, 245, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: APP_COLORS.navy,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: fonts.bold,
    marginBottom: 8,
  },
  body: {
    color: APP_COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: fonts.regular,
    marginBottom: 24,
  },
  actions: {
    gap: 10,
  },
});
