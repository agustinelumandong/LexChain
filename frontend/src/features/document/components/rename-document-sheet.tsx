import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const insets = useSafeAreaInsets();
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  const snapPoints = useMemo(() => ['40%'], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
        setNewName(currentName);
        setError(null);
      }
    },
    [onClose, currentName],
  );

  const handleRename = useCallback(() => {
    const trimmedName = newName.trim();
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
  }, [newName, onRename]);

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

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      setNewName(currentName);
      setError(null);
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.title}>Rename Document</Text>
        <Text style={styles.subtitle}>Enter a new name for your document</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>File Name</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={newName}
            onChangeText={(text) => {
              setNewName(text);
              setError(null);
            }}
            placeholder="Document name"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
            selectTextOnFocus
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

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
              disabled={isLoading || !newName.trim()}
              loading={isLoading}
            />
          </View>
        </View>
      </View>
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
    backgroundColor: COLORS.surfaceSoft,
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
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
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    fontFamily: fonts.regular,
    marginBottom: 8,
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
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    fontFamily: fonts.regular,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
});