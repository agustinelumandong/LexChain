import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import {
  documentSearchBarColors,
  documentSearchBarStyles,
} from './document-search-bar.styles';

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
    <View style={[documentSearchBarStyles.wrap, isFocused && documentSearchBarStyles.wrapFocused]}>
      <View style={[documentSearchBarStyles.inputRow, isFocused && documentSearchBarStyles.inputRowFocused]}>
        <MaterialIcons
          name="search"
          size={18}
          color={isFocused ? documentSearchBarColors.primary : documentSearchBarColors.textMuted}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search within this document..."
          placeholderTextColor={documentSearchBarColors.textMuted}
          style={documentSearchBarStyles.input}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} style={documentSearchBarStyles.clearButton}>
            <MaterialIcons name="close" size={16} color={documentSearchBarColors.textMuted} />
          </Pressable>
        )}
      </View>

      {shouldShowSubmit && (
        <Pressable
          onPress={handleSubmit}
          style={[
            documentSearchBarStyles.searchButton,
            !hasQuery && documentSearchBarStyles.searchButtonDisabled,
            isLoading && documentSearchBarStyles.searchButtonLoading,
          ]}
          disabled={isLoading || !hasQuery}
        >
          {isLoading ? (
            <MaterialIcons name="hourglass-empty" size={16} color={documentSearchBarColors.surface} />
          ) : (
            <MaterialIcons name="arrow-forward" size={16} color={documentSearchBarColors.surface} />
          )}
        </Pressable>
      )}
    </View>
  );
}
