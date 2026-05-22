import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetFooterProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
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
  const askSheet = useAskDocumentSheet({
    visible,
    answer,
    isLoading,
    errorMessage,
    onClose,
    onAsk,
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
      <AskDocumentComposer
        {...props}
        bottomInset={askSheet.insets.bottom}
        resetKey={askSheet.composerResetKey}
        onSubmit={askSheet.handleSubmitQuestion}
        onFocusComposer={askSheet.handleFocusComposer}
        onLayoutComposer={askSheet.handleComposerLayout}
        animatedStyle={askSheet.composerAnimatedStyle}
      />
    ),
    [
      askSheet.composerAnimatedStyle,
      askSheet.composerResetKey,
      askSheet.handleComposerLayout,
      askSheet.handleFocusComposer,
      askSheet.handleSubmitQuestion,
      askSheet.insets.bottom,
    ],
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
      <BottomSheet
        ref={askSheet.bottomSheetRef}
        index={0}
        snapPoints={askSheet.snapPoints}
        containerStyle={styles.overlay}
        onClose={askSheet.handleDismiss}
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
          ref={askSheet.scrollViewRef}
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: askSheet.scrollBottomPadding },
          ]}
          onContentSizeChange={askSheet.scrollToLatestMessage}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AskDocumentMessages messages={askSheet.messages} isLoading={isLoading} />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
