import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  surface: APP_COLORS.surface,
  inputBorder: '#B9D9FF',
};

type DocumentSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
};

export function DocumentSearchBar({
  value,
  onChangeText,
  onSubmit,
  isLoading = false,
}: DocumentSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasQuery = value.trim().length > 0;
  const shouldShowSubmit = isFocused || hasQuery;

  const handleSubmit = () => {
    if (hasQuery) {
      onSubmit();
    }
  };

  return (
    <View style={[styles.wrap, isFocused && styles.wrapFocused]}>
      <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
        <MaterialIcons
          name="search"
          size={18}
          color={isFocused ? COLORS.primary : COLORS.textMuted}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search within this document..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
            <MaterialIcons name="close" size={16} color={COLORS.textMuted} />
          </Pressable>
        )}
      </View>

      {shouldShowSubmit && (
        <Pressable
          onPress={handleSubmit}
          style={[
            styles.searchButton,
            !hasQuery && styles.searchButtonDisabled,
            isLoading && styles.searchButtonLoading,
          ]}
          disabled={isLoading || !hasQuery}
        >
          {isLoading ? (
            <MaterialIcons name="hourglass-empty" size={16} color={COLORS.surface} />
          ) : (
            <MaterialIcons name="arrow-forward" size={16} color={COLORS.surface} />
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wrapFocused: {},
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 16,
    minHeight: 50,
    shadowColor: '#133B731A',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  inputRowFocused: {
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  input: {
    flex: 1,
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
    paddingVertical: 10,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  searchButtonLoading: {
    opacity: 0.7,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.borderSoft,
    shadowOpacity: 0,
    elevation: 0,
  },
});
