import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_COLORS, fonts } from '@/theme';

const BOT_AVATAR = require('../../../../assets/images/lexchain-bot.png');

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

type AskComposerProps = BottomSheetFooterProps & {
  bottomInset: number;
  resetKey: number;
  onSubmit: (question: string) => void;
  onFocusComposer: () => void;
  animatedStyle: React.ComponentProps<typeof Animated.View>['style'];
};

const AskComposer = React.memo(function AskComposer({
  bottomInset,
  resetKey,
  onSubmit,
  onFocusComposer,
  animatedStyle,
  ...footerProps
}: AskComposerProps) {
  const inputRef = useRef<TextInput>(null);
  const [question, setQuestion] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const hasQuestion = question.trim().length > 0;
  const shouldShowSubmit = isFocused || hasQuestion;

  const keepInputFocused = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      keepInputFocused();
      return;
    }

    onSubmit(trimmedQuestion);
    setQuestion('');
    keepInputFocused();
  }, [keepInputFocused, onSubmit, question]);

  useEffect(() => {
    setQuestion('');
    setIsFocused(false);
  }, [resetKey]);

  return (
    <BottomSheetFooter
      {...footerProps}
      bottomInset={bottomInset}
      style={styles.footerContainer}
    >
      <Animated.View style={[styles.composer, animatedStyle]}>
        <Pressable
          style={styles.inputShell}
          onPress={() => {
            onFocusComposer();
            setIsFocused(true);
            inputRef.current?.focus();
          }}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask a question about this document..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            blurOnSubmit={false}
            onFocus={() => {
              setIsFocused(true);
              onFocusComposer();
            }}
            onBlur={() => setIsFocused(false)}
            textAlignVertical="top"
          />
        </Pressable>
        {shouldShowSubmit ? (
          <Pressable
            style={[
              styles.sendButton,
              !hasQuestion && styles.sendButtonDisabled,
            ]}
            disabled={!hasQuestion}
            onPressIn={keepInputFocused}
            onPress={handleSubmit}
            accessibilityRole="button"
            accessibilityLabel="Send question"
          >
            <MaterialIcons name="arrow-upward" size={20} color={COLORS.white} />
          </Pressable>
        ) : null}
      </Animated.View>
    </BottomSheetFooter>
  );
});

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
  const scrollViewRef = useRef<React.ElementRef<typeof BottomSheetScrollView>>(null);
  const insets = useSafeAreaInsets();
  const [lastAnswer, setLastAnswer] = useState<string | undefined>();
  const [composerResetKey, setComposerResetKey] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Ask questions about this document and I will answer from its extracted content.',
    },
  ]);

  const snapPoints = useMemo(() => ['70%', '95%'], []);
  const keyboard = useAnimatedKeyboard();
  const composerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: -Math.max(0, keyboard.height.value - insets.bottom),
      },
    ],
  }));

  const handleDismiss = useCallback(() => {
    setComposerResetKey((currentKey) => currentKey + 1);
    onClose();
  }, [onClose]);

  const handleFocusComposer = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const scrollToLatestMessage = useCallback(() => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, []);

  const handleSubmitQuestion = useCallback((trimmedQuestion: string) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmedQuestion,
      },
    ]);
    scrollToLatestMessage();
    onAsk(trimmedQuestion);
  }, [onAsk, scrollToLatestMessage]);

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
      <AskComposer
        {...props}
        bottomInset={insets.bottom}
        resetKey={composerResetKey}
        onSubmit={handleSubmitQuestion}
        onFocusComposer={handleFocusComposer}
        animatedStyle={composerAnimatedStyle}
      />
    ),
    [
      composerAnimatedStyle,
      composerResetKey,
      handleFocusComposer,
      handleSubmitQuestion,
      insets.bottom,
    ],
  );

  useEffect(() => {
    const sheet = bottomSheetRef.current;

    if (!sheet) {
      return;
    }

    if (visible) {
      setComposerResetKey((currentKey) => currentKey + 1);
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
    scrollToLatestMessage();
  }, [answer, lastAnswer, scrollToLatestMessage]);

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
    scrollToLatestMessage();
  }, [errorMessage, scrollToLatestMessage]);

  useEffect(() => {
    if (isLoading) {
      scrollToLatestMessage();
    }
  }, [isLoading, scrollToLatestMessage]);

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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 420 },
        ]}
        onContentSizeChange={scrollToLatestMessage}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          message.role === 'assistant' ? (
            <View key={message.id} style={styles.assistantMessageRow}>
              <Image
                source={BOT_AVATAR}
                style={styles.botAvatar}
                contentFit="contain"
              />
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <Text style={[styles.messageText, styles.assistantText]}>
                  {message.text}
                </Text>
              </View>
            </View>
          ) : (
            <View key={message.id} style={[styles.messageBubble, styles.userBubble]}>
              <Text style={[styles.messageText, styles.userText]}>
                {message.text}
              </Text>
            </View>
          )
        ))}

        {isLoading && (
          <View style={styles.assistantMessageRow}>
            <Image
              source={BOT_AVATAR}
              style={styles.botAvatar}
              contentFit="contain"
            />
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <Text style={[styles.messageText, styles.assistantText]}>Thinking...</Text>
            </View>
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
  assistantMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '92%',
  },
  botAvatar: {
    width: 32,
    height: 32,
    marginBottom: 2,
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
    backgroundColor: COLORS.primary,
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
  inputShell: {
    flex: 1,
    minHeight: 56,
    maxHeight: 118,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
  },
  input: {
    minHeight: 56,
    maxHeight: 118,
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
