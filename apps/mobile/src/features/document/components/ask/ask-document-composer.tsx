import { BottomSheetFooter, type BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';

import { ASK_DOCUMENT_COLORS as COLORS, askDocumentStyles as styles } from './ask-document.styles';

type AskDocumentComposerProps = BottomSheetFooterProps & {
  bottomInset: number;
  resetKey: number;
  onSubmit: (question: string) => void;
  onFocusComposer: () => void;
  onLayoutComposer: (height: number) => void;
  animatedStyle: React.ComponentProps<typeof Animated.View>['style'];
};

export const AskDocumentComposer = React.memo(function AskDocumentComposer({
  bottomInset,
  resetKey,
  onSubmit,
  onFocusComposer,
  onLayoutComposer,
  animatedStyle,
  ...footerProps
}: AskDocumentComposerProps) {
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

  const handleComposerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayoutComposer(Math.ceil(event.nativeEvent.layout.height));
    },
    [onLayoutComposer],
  );

  return (
    <BottomSheetFooter
      {...footerProps}
      bottomInset={bottomInset}
      style={styles.footerContainer}
    >
      <Animated.View style={[styles.composer, animatedStyle]} onLayout={handleComposerLayout}>
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
