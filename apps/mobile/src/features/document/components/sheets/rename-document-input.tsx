import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Text, View } from 'react-native';

import {
  RENAME_DOCUMENT_COLORS as COLORS,
  renameDocumentStyles as styles,
} from './rename-document.styles';

type RenameDocumentInputProps = {
  value: string;
  error: string | null;
  isFocused: boolean;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSubmitEditing: () => void;
};

export function RenameDocumentInput({
  value,
  error,
  isFocused,
  onChangeText,
  onFocus,
  onBlur,
  onSubmitEditing,
}: RenameDocumentInputProps) {
  return (
    <View style={styles.inputStack}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>File Name</Text>
        <BottomSheetTextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Document name"
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="done"
          blurOnSubmit={false}
          autoCorrect={false}
          autoCapitalize="sentences"
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
}
