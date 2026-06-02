import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_COLORS, fonts } from '@/theme';
import { Button } from '@/ui';

type MfaVerificationSheetProps = {
  code: string;
  email: string;
  isLoading: boolean;
  visible: boolean;
  onCancel: () => void;
  onChangeCode: (code: string) => void;
  onVerify: () => void;
};

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

export function MfaVerificationSheet({
  code,
  email,
  isLoading,
  visible,
  onCancel,
  onChangeCode,
  onVerify,
}: MfaVerificationSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['100%'], []);
  const digits = Array.from({ length: 6 }, (_, index) => code[index] ?? '');
  const canVerify = code.length === 6 && !isLoading;

  const appendDigit = (digit: string) => {
    if (isLoading || code.length >= 6) {
      return;
    }

    void Haptics.selectionAsync();
    onChangeCode(`${code}${digit}`);
  };

  const deleteDigit = () => {
    if (isLoading || code.length === 0) {
      return;
    }

    void Haptics.selectionAsync();
    onChangeCode(code.slice(0, -1));
  };

  const renderBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      pressBehavior="none"
      style={styles.backdrop}
    />
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
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        handleComponent={null}
        backgroundStyle={styles.sheet}
        containerStyle={styles.overlay}
      >
        <BottomSheetView
          style={[
            styles.content,
            {
              paddingTop: Math.max(insets.top, 18) + 12,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.iconBubble}>
              <MaterialIcons name="verified-user" size={28} color={APP_COLORS.primary} />
            </View>
            <Text style={styles.eyebrow}>TWO-FACTOR AUTHENTICATION</Text>
            <Text style={styles.title}>Enter verification code</Text>
            <Text style={styles.description}>
              Open your authenticator app and enter the 6-digit code for
              {email ? ` ${email}` : ' this account'}.
            </Text>
          </View>

          <View style={styles.codeAndVerify}>
            <View style={styles.codeRow} accessibilityRole="text">
              {digits.slice(0, 3).map((digit, index) => (
                <View
                  key={`${index}-${digit || 'empty'}`}
                  style={[
                    styles.codeBox,
                    digit ? styles.codeBoxFilled : null,
                    index === code.length && !digit ? styles.codeBoxActive : null,
                  ]}
                >
                  <Text style={styles.codeDigit}>{digit}</Text>
                </View>
              ))}
              <Text style={styles.codeDash}>-</Text>
              {digits.slice(3).map((digit, index) => {
                const digitIndex = index + 3;

                return (
                  <View
                    key={`${digitIndex}-${digit || 'empty'}`}
                    style={[
                      styles.codeBox,
                      digit ? styles.codeBoxFilled : null,
                      digitIndex === code.length && !digit ? styles.codeBoxActive : null,
                    ]}
                  >
                    <Text style={styles.codeDigit}>{digit}</Text>
                  </View>
                );
              })}
            </View>
            <Button
              label="Verify"
              fullWidth
              leftIconName="verified-user"
              loading={isLoading}
              disabled={!canVerify}
              onPress={onVerify}
            />
          </View>

          <View style={styles.numpad}>
            {DIGIT_ROWS.map((row) => (
              <View key={row.join('-')} style={styles.numpadRow}>
                {row.map((digit) => (
                  <Pressable
                    key={digit}
                    accessibilityRole="button"
                    accessibilityLabel={`Enter ${digit}`}
                    disabled={isLoading}
                    onPress={() => appendDigit(digit)}
                    style={({ pressed }) => [
                      styles.numpadKey,
                      pressed && styles.numpadKeyPressed,
                    ]}
                  >
                    <Text style={styles.numpadDigit}>{digit}</Text>
                  </Pressable>
                ))}
              </View>
            ))}
            <View style={styles.numpadRow}>
              <View style={styles.numpadKeyGhost} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Enter 0"
                disabled={isLoading}
                onPress={() => appendDigit('0')}
                style={({ pressed }) => [
                  styles.numpadKey,
                  pressed && styles.numpadKeyPressed,
                ]}
              >
                <Text style={styles.numpadDigit}>0</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete last digit"
                disabled={isLoading || code.length === 0}
                onPress={deleteDigit}
                style={({ pressed }) => [
                  styles.numpadKey,
                  styles.numpadIconKey,
                  pressed && styles.numpadKeyPressed,
                  code.length === 0 && styles.numpadKeyDisabled,
                ]}
              >
                <MaterialIcons name="backspace" size={24} color={APP_COLORS.navy} />
              </Pressable>
            </View>
          </View>
           <View style={styles.actions}>
            <Button
              label="Back to sign in"
              variant="ghost"
              fullWidth
              leftIconName="arrow-back"
              disabled={isLoading}
              onPress={onCancel}
            />
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
    backgroundColor: 'rgba(7, 22, 43, 0.58)',
  },
  sheet: {
    backgroundColor: APP_COLORS.bg,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
  },
  eyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 320,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  codeAndVerify: {
    gap: 14,
  },
  codeBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxActive: {
    borderColor: APP_COLORS.primary,
    backgroundColor: APP_COLORS.surfaceSoft,
  },
  codeBoxFilled: {
    borderColor: APP_COLORS.primary,
  },
  codeDigit: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  codeDash: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    paddingHorizontal: 1,
  },
  numpad: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 286,
    gap: 10,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  numpadKey: {
    width: 82,
    height: 82,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.white,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
  },
  numpadKeyPressed: {
    backgroundColor: APP_COLORS.surfaceSoft,
    transform: [{ scale: 0.98 }],
  },
  numpadKeyDisabled: {
    opacity: 0.45,
  },
  numpadKeyGhost: {
    width: 68,
    height: 56,
  },
  numpadIconKey: {
    backgroundColor: APP_COLORS.surfaceSoft,
  },
  numpadDigit: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 32,
    lineHeight: 30,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  actions: {
    gap: 10,
    marginBottom: -10,
  },
});
