import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  searchInputWithResultsColors,
  searchInputWithResultsStyles as styles,
} from './search-input-with-results.styles';

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
          <MaterialIcons name="search" size={18} color={searchInputWithResultsColors.textMuted} />
          <InputComponent
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={searchInputWithResultsColors.textMuted}
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
