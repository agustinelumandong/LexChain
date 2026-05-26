import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetFooterProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AskDocumentComposer } from './ask-document-composer';
import { AskDocumentMessages } from './ask-document-messages';
import { ASK_DOCUMENT_COLORS as COLORS, askDocumentStyles as styles } from './ask-document.styles';
import { useAskDocumentSheet } from '../../hooks/use-ask-document-sheet';

type AskDocumentSheetProps = {
  visible: boolean;
  documentTitle: string;
  answer?: string;
  isLoading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onAsk: (question: string) => void;
};

export function AskDocumentSheet({
  visible,
  documentTitle,
  answer,
  isLoading,
  errorMessage,
  onClose,
  onAsk,
}: AskDocumentSheetProps) {
  const {
    bottomSheetRef,
    scrollViewRef,
    insets,
    messages,
    snapPoints,
    composerResetKey,
    composerAnimatedStyle,
    scrollBottomPadding,
    handleDismiss,
    handleComposerLayout,
    handleFocusComposer,
    handleSubmitQuestion,
    scrollToLatestMessage,
  } = useAskDocumentSheet({
    visible,
    answer,
    isLoading,
    errorMessage,
    onClose,
    onAsk,
  });
  const scrollContentContainerStyle = useMemo(
    () => [
      styles.scrollContent,
      { paddingBottom: scrollBottomPadding },
    ],
    [scrollBottomPadding],
  );

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
      <AskDocumentComposer
        {...props}
        bottomInset={insets.bottom}
        resetKey={composerResetKey}
        onSubmit={handleSubmitQuestion}
        onFocusComposer={handleFocusComposer}
        onLayoutComposer={handleComposerLayout}
        animatedStyle={composerAnimatedStyle}
      />
    ),
    [
      composerAnimatedStyle,
      composerResetKey,
      handleComposerLayout,
      handleFocusComposer,
      handleSubmitQuestion,
      insets.bottom,
    ],
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        containerStyle={styles.overlay}
        onClose={handleDismiss}
        enableDynamicSizing={false}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustPan"
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="question-answer" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Chat</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Ask about {documentTitle || 'this document'}
            </Text>
          </View>
        </View>

        <BottomSheetScrollView
          ref={scrollViewRef}
          style={styles.scrollArea}
          contentContainerStyle={scrollContentContainerStyle}
          onContentSizeChange={scrollToLatestMessage}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AskDocumentMessages messages={messages} isLoading={isLoading} />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
