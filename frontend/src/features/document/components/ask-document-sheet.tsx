import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_COLORS, fonts } from '@/theme';

const COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  white: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  error: '#DC2626',
  success: '#03A66A',
};

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Ask questions about this document and I will answer from its extracted content.',
    },
  ]);

  const snapPoints = useMemo(() => ['70%', '95%'], []);

  const handleDismiss = useCallback(() => {
    onClose();
    setQuestion('');
    setKeyboardHeight(0);
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmedQuestion,
      },
    ]);
    setQuestion('');
    onAsk(trimmedQuestion);
  }, [isLoading, onAsk, question]);

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
      <BottomSheetFooter
        {...props}
        bottomInset={insets.bottom}
        style={styles.footerContainer}
      >
        <View
          style={[
            styles.composer,
            keyboardHeight > 0 && {
              transform: [{ translateY: -keyboardHeight }],
            },
          ]}
        >
          <BottomSheetTextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask a question about this document..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
          <Pressable
            style={[
              styles.sendButton,
              (!question.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            disabled={!question.trim() || isLoading}
            onPress={handleSubmit}
            accessibilityRole="button"
            accessibilityLabel="Send question"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <MaterialIcons name="arrow-upward" size={20} color={COLORS.white} />
            )}
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [handleSubmit, insets.bottom, isLoading, keyboardHeight, question],
  );

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      sheet.present();
      return;
    }

    sheet.dismiss();
  }, [visible]);

  useEffect(() => {
    if (!answer || answer === lastAnswer) {
      return;
    }

    setLastAnswer(answer);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: answer,
      },
    ]);
  }, [answer, lastAnswer]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: errorMessage,
      },
    ]);
  }, [errorMessage]);

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
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 140 + keyboardHeight },
        ]}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.assistantText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <Text style={[styles.messageText, styles.assistantText]}>Thinking...</Text>
          </View>
        )}
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
    backgroundColor: COLORS.surfaceSoft,
    width: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: COLORS.sheet,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
    fontFamily: fonts.regular,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.success,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    fontWeight: '600',
  },
  assistantText: {
    color: COLORS.navy,
  },
  userText: {
    color: COLORS.white,
  },
  footerContainer: {
    backgroundColor: 'transparent',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: COLORS.sheet,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },
  input: {
    flex: 1,
    minHeight: 56,
    maxHeight: 118,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    color: COLORS.navy,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.borderSoft,
  },
});
