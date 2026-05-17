import { TextInput, View } from 'react-native';

import {
  ASK_DOCUMENT_CARD_COLORS as COLORS,
  askDocumentCardStyles as styles,
} from './ask-document-card.styles';

type AskDocumentQuestionInputProps = {
  value: string;
  isFocused: boolean;
  isLoading: boolean;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
};

export function AskDocumentQuestionInput({
  value,
  isFocused,
  isLoading,
  onChangeText,
  onFocus,
  onBlur,
}: AskDocumentQuestionInputProps) {
  return (
    <View style={[styles.inputWrap, isFocused && styles.inputWrapFocused]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Ask a question about this document..."
        placeholderTextColor={COLORS.textMuted}
        style={styles.input}
        multiline
        numberOfLines={2}
        onFocus={onFocus}
        onBlur={onBlur}
        editable={!isLoading}
      />
    </View>
  );
}
