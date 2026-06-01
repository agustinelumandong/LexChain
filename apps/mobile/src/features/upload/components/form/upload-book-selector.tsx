import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import type { BookResponse } from '@/services/api';
import { APP_COLORS } from '@/theme';

import { uploadBookSelectorStyles as styles } from './upload-book-selector.styles';

type UploadBookSelectorProps = {
  selectedBook?: BookResponse;
  disabled?: boolean;
  onPress: () => void;
};

export function UploadBookSelector({
  selectedBook,
  disabled,
  onPress,
}: UploadBookSelectorProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Register Book</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose register book"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.selector,
          disabled && styles.selectorDisabled,
          pressed && !disabled && styles.selectorPressed,
        ]}
      >
        <View style={styles.iconBubble}>
          <MaterialIcons name="library-books" size={20} color={APP_COLORS.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>
            {selectedBook
              ? `Book ${selectedBook.book_number} - Series ${selectedBook.series_year}`
              : 'Choose register book'}
          </Text>
          <Text style={styles.description}>
            {selectedBook
              ? `${selectedBook.document_count} documents - ${selectedBook.page_count} pages`
              : 'Required before uploading'}
          </Text>
        </View>
        <MaterialIcons name="expand-more" size={22} color={APP_COLORS.textMuted} />
      </Pressable>
    </View>
  );
}
