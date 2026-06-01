import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BookResponse } from '@/services/api';
import { Button, EmptyState, LoadingState } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

type UploadBookBottomSheetProps = {
  books: BookResponse[];
  isLoading: boolean;
  selectedBookId: string;
  visible: boolean;
  onClose: () => void;
  onCreateBook: () => void;
  onSelect: (bookId: string) => void;
};

export function UploadBookBottomSheet({
  books,
  isLoading,
  selectedBookId,
  visible,
  onClose,
  onCreateBook,
  onSelect,
}: UploadBookBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['58%'], []);

  const renderBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      pressBehavior="close"
      style={styles.backdrop}
    />
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        containerStyle={styles.overlay}
        onClose={onClose}
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheet}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>REGISTER BOOK</Text>
            <Text style={styles.title}>Choose register book</Text>
            <Text style={styles.description}>
              Documents must be assigned to a legal register book.
            </Text>
          </View>

          {isLoading ? <LoadingState message="Loading books..." /> : null}

          {!isLoading && books.length === 0 ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                title="No register books yet"
                message="Create a register book before uploading."
              />
              <Button
                label="Create book"
                leftIconName="library-books"
                fullWidth
                onPress={onCreateBook}
              />
            </View>
          ) : null}

          {!isLoading && books.length > 0 ? (
            <Button
              label="Create book"
              leftIconName="add"
              variant="secondary"
              fullWidth
              onPress={onCreateBook}
            />
          ) : null}

          <View style={styles.options}>
            {books.map((book) => {
              const selected = book.id === selectedBookId;

              return (
                <Pressable
                  key={book.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select Book ${book.book_number}`}
                  onPress={() => onSelect(book.id)}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <View style={styles.optionCopy}>
                    <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                      Book {book.book_number} - Series {book.series_year}
                    </Text>
                    <Text style={styles.optionMeta}>
                      {book.document_count} documents - {book.page_count} pages
                    </Text>
                  </View>
                  <MaterialIcons
                    name={selected ? 'check-circle' : 'chevron-right'}
                    size={22}
                    color={selected ? APP_COLORS.primary : APP_COLORS.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
  },
  backdrop: {
    backgroundColor: 'rgba(7, 22, 43, 0.42)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: APP_COLORS.white,
  },
  handle: {
    backgroundColor: APP_COLORS.borderSoft,
  },
  content: {
    paddingHorizontal: 18,
    gap: 12,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: APP_COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
  },
  description: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  emptyWrap: {
    gap: 12,
  },
  options: {
    gap: 10,
  },
  option: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
    backgroundColor: '#F7FBFF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionSelected: {
    borderColor: APP_COLORS.primary,
    backgroundColor: APP_COLORS.surfaceSoft,
  },
  optionPressed: {
    opacity: 0.74,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  optionTitleSelected: {
    color: APP_COLORS.primary,
  },
  optionMeta: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
