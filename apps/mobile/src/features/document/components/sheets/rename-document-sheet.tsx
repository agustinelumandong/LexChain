import {
  BottomSheetBackdrop,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';

import { RenameDocumentFooter } from './rename-document-footer';
import { RenameDocumentInput } from './rename-document-input';
import { renameDocumentStyles as styles } from './rename-document.styles';
import { useRenameDocumentSheet } from '../../hooks/use-rename-document-sheet';

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
  const renameSheet = useRenameDocumentSheet({
    visible,
    currentName,
    onClose,
    onRename,
  });

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
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
      <RenameDocumentFooter
        {...props}
        bottomInset={renameSheet.insets.bottom}
        bottomSheetRef={renameSheet.bottomSheetRef}
        keyboardHeight={renameSheet.keyboardHeight}
        canRename={renameSheet.canRename}
        isLoading={isLoading}
        onRename={renameSheet.handleRename}
      />
    ),
    [
      isLoading,
      renameSheet.bottomSheetRef,
      renameSheet.canRename,
      renameSheet.handleRename,
      renameSheet.insets.bottom,
      renameSheet.keyboardHeight,
    ],
  );

  return (
    <BottomSheetModal
      ref={renameSheet.bottomSheetRef}
      index={0}
      snapPoints={renameSheet.snapPoints}
      onDismiss={renameSheet.handleDismiss}
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
      <View style={[styles.header, renameSheet.headerHasShadow && styles.headerShadow]}>
        <Text style={styles.title}>Rename Document</Text>
        <Text style={styles.subtitle}>Enter a new name for your document</Text>
      </View>

      <BottomSheetScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 170 + renameSheet.keyboardHeight },
        ]}
        onScroll={renameSheet.handleScroll}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RenameDocumentInput
          value={renameSheet.newName}
          error={renameSheet.error}
          isFocused={renameSheet.isInputFocused}
          onChangeText={renameSheet.handleChangeName}
          onFocus={renameSheet.handleFocusInput}
          onBlur={renameSheet.handleBlurInput}
          onSubmitEditing={renameSheet.handleRename}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
