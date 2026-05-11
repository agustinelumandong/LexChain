import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

const COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  error: '#DC2626',
};

type RenameDocumentSheetProps = {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
  isLoading?: boolean;
};

export function RenameDocumentSheet({
  visible,
  currentName,
  onClose,
  onRename,
  isLoading,
}: RenameDocumentSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const latestNameRef = useRef(currentName);
  const insets = useSafeAreaInsets();
  const [newName, setNewName] = useState(currentName);
  const [canRename, setCanRename] = useState(Boolean(currentName.trim()));
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [headerHasShadow, setHeaderHasShadow] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const snapPoints = useMemo(() => ['70%'], []);

  const handleDismiss = useCallback(() => {
    onClose();
    latestNameRef.current = currentName;
    setNewName(currentName);
    setCanRename(Boolean(currentName.trim()));
    setError(null);
    setHeaderHasShadow(false);
    setIsInputFocused(false);
  }, [currentName, onClose]);

  const handleRename = useCallback(() => {
    const trimmedName = latestNameRef.current.trim();
    if (!trimmedName) {
      setError('Name cannot be empty');
      return;
    }
    if (trimmedName.length > 255) {
      setError('Name is too long (max 255 characters)');
      return;
    }
    setError(null);
    Keyboard.dismiss();
    onRename(trimmedName);
  }, [onRename]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
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
        <View
          style={[
            styles.footer,
            keyboardHeight > 0 && {
              transform: [{ translateY: -keyboardHeight }],
            },
          ]}
        >
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => bottomSheetRef.current?.close()}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                label={isLoading ? 'Renaming...' : 'Rename'}
                onPress={handleRename}
                disabled={isLoading || !canRename}
                loading={isLoading}
              />
            </View>
          </View>
        </View>
      </BottomSheetFooter>
    ),
    [canRename, handleRename, insets.bottom, isLoading, keyboardHeight],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const shouldShowShadow = event.nativeEvent.contentOffset.y > 2;
      if (shouldShowShadow !== headerHasShadow) {
        setHeaderHasShadow(shouldShowShadow);
      }
    },
    [headerHasShadow],
  );

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      latestNameRef.current = currentName;
      setNewName(currentName);
      setCanRename(Boolean(currentName.trim()));
      setError(null);
      setHeaderHasShadow(false);
      setIsInputFocused(false);
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [currentName, visible]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(Math.max(0, event.endCoordinates.height - insets.bottom));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [insets.bottom]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={[styles.header, headerHasShadow && styles.headerShadow]}>
        <Text style={styles.title}>Rename Document</Text>
        <Text style={styles.subtitle}>Enter a new name for your document</Text>
      </View>

      <BottomSheetScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 170 + keyboardHeight },
        ]}
        onScroll={handleScroll}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputStack}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>File Name</Text>
            <BottomSheetTextInput
              style={[
                styles.input,
                isInputFocused && styles.inputFocused,
                error && styles.inputError,
              ]}
              value={newName}
              onChangeText={(text) => {
                latestNameRef.current = text;
                setNewName(text);
                setCanRename(Boolean(text.trim()));
                setError(null);
              }}
              placeholder="Document name"
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="done"
              blurOnSubmit={false}
              autoCorrect={false}
              autoCapitalize="sentences"
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onSubmitEditing={handleRename}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: COLORS.borderSoft,
    width: 40,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    backgroundColor: COLORS.sheet,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    zIndex: 1,
  },
  headerShadow: {
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.navy,
    fontFamily: fonts.regular,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
  },
  inputStack: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    fontFamily: fonts.regular,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.navy,
    fontFamily: fonts.regular,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    fontFamily: fonts.regular,
  },
  footerContainer: {
    backgroundColor: 'transparent',
  },
  footer: {
    backgroundColor: COLORS.sheet,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
});
