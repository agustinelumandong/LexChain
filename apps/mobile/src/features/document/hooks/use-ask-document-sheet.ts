import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AskDocumentChatMessage } from '../types/ask-document.types';

type UseAskDocumentSheetParams = {
  visible: boolean;
  answer?: string;
  isLoading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onAsk: (question: string) => void;
};

const WELCOME_MESSAGE: AskDocumentChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Ask questions about this document and I will answer from its extracted content.',
};

export function useAskDocumentSheet({
  visible,
  answer,
  isLoading,
  errorMessage,
  onClose,
  onAsk,
}: UseAskDocumentSheetParams) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<React.ElementRef<typeof BottomSheetScrollView>>(null);
  const insets = useSafeAreaInsets();
  const [lastAnswer, setLastAnswer] = useState<string | undefined>();
  const [composerResetKey, setComposerResetKey] = useState(0);
  const [messages, setMessages] = useState<AskDocumentChatMessage[]>([WELCOME_MESSAGE]);

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

  useEffect(() => {
    if (visible) {
      setComposerResetKey((currentKey) => currentKey + 1);
    }
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

  return {
    bottomSheetRef,
    scrollViewRef,
    insets,
    messages,
    snapPoints,
    composerResetKey,
    composerAnimatedStyle,
    handleDismiss,
    handleFocusComposer,
    handleSubmitQuestion,
    scrollToLatestMessage,
  };
}
