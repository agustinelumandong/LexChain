import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  surface: APP_COLORS.surface,
  inputBorder: '#B9D9FF',
};

type SearchInputWithResultsProps<T> = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  results: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyText?: string;
  showResults?: boolean;
  showDropdown?: boolean;
  inputMode?: 'default' | 'bottom-sheet';
};

export function SearchInputWithResults<T>({
  label,
  value,
  onChangeText,
  placeholder,
  results,
  keyExtractor,
  renderItem,
  emptyText = 'No results found',
  showResults = false,
  showDropdown = true,
  inputMode = 'default',
}: SearchInputWithResultsProps<T>) {
  const shouldShowDropdown = showResults && showDropdown;
  const hasResults = results.length > 0;
  const InputComponent = inputMode === 'bottom-sheet' ? BottomSheetTextInput : TextInput;

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.anchor}>
        <View
          style={[
            styles.inputWrap,
            shouldShowDropdown && styles.inputWrapActive,
          ]}
        >
          <MaterialIcons name="search" size={18} color={COLORS.textMuted} />
          <InputComponent
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />
        </View>

        {shouldShowDropdown ? (
          <View style={styles.dropdown}>
            {hasResults ? (
              results.map((item, index) => (
                <React.Fragment key={keyExtractor(item, index)}>
                  {renderItem(item, index)}
                </React.Fragment>
              ))
            ) : (
              <Pressable style={styles.emptyState} disabled>
                <Text style={styles.emptyText}>{emptyText}</Text>
              </Pressable>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    zIndex: 20,
  },
  label: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  anchor: {
    position: 'relative',
  },
  inputWrap: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.surface,
    shadowColor: '#133B731A',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  inputWrapActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  input: {
    flex: 1,
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
    shadowColor: '#133B731A',
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
    zIndex: 30,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
});
