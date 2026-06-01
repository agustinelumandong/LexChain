import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import type { BookResponse } from '@/services/api';
import { useBooks, useCreateBook, useUserProfile } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { canRoleUploadDocuments } from '@/features/profile';
import { Button, EmptyState, ErrorState, LoadingState, ScreenHeader } from '@/ui';
import { APP_COLORS } from '@/theme';

import { booksScreenStyles as styles } from './books-screen.styles';

const HEADER_CONTENT_GAP = 12;

function formatBookTitle(book: BookResponse) {
  return `Book ${book.book_number}`;
}

function BookCard({
  book,
  onPress,
}: {
  book: BookResponse;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${formatBookTitle(book)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardTopLine}>
        <View>
          <Text style={styles.cardTitle}>{formatBookTitle(book)}</Text>
          <Text style={styles.cardMeta}>Series {book.series_year}</Text>
        </View>
        <Text style={[styles.statusPill, book.is_full && styles.statusPillFull]}>
          {book.is_full ? 'Full' : 'Active'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{book.document_count}</Text>
          <Text style={styles.statLabel}>Documents</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{book.page_count}</Text>
          <Text style={styles.statLabel}>Pages</Text>
        </View>
      </View>
    </Pressable>
  );
}

function CreateBookSheet({
  isCreating,
  visible,
  onClose,
  onCreate,
}: {
  isCreating: boolean;
  visible: boolean;
  onClose: () => void;
  onCreate: (bookNumber: number, seriesYear: number) => void;
}) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['75%'], []);
  const currentYear = new Date().getFullYear();
  const [bookNumber, setBookNumber] = useState('');
  const [seriesYear, setSeriesYear] = useState(String(currentYear));

  const renderBackdrop = (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      pressBehavior="close"
      style={styles.sheetBackdrop}
    />
  );

  if (!visible) {
    return null;
  }

  const parsedBookNumber = Number(bookNumber);
  const parsedSeriesYear = Number(seriesYear);
  const canSubmit =
    Number.isInteger(parsedBookNumber) &&
    parsedBookNumber >= 1 &&
    parsedBookNumber <= 1000 &&
    Number.isInteger(parsedSeriesYear) &&
    parsedSeriesYear >= 2000;

  return (
    <View style={styles.sheetOverlay} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        containerStyle={styles.sheetOverlay}
        onClose={onClose}
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheet}
      >
        <BottomSheetView
          style={[
            styles.sheetContent,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          <View>
            <Text style={styles.sheetTitle}>Create register book</Text>
            <Text style={styles.sheetText}>
              Add a physical register volume before uploading documents.
            </Text>
          </View>

          <View style={styles.inputStack}>
            <Text style={styles.inputLabel}>Book number</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={APP_COLORS.textMuted}
              value={bookNumber}
              onChangeText={setBookNumber}
              style={styles.input}
            />
          </View>

          <View style={styles.inputStack}>
            <Text style={styles.inputLabel}>Series year</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder={String(currentYear)}
              placeholderTextColor={APP_COLORS.textMuted}
              value={seriesYear}
              onChangeText={setSeriesYear}
              style={styles.input}
            />
          </View>

          <View style={styles.sheetActions}>
            <View style={styles.actionButton}>
              <Button label="Cancel" variant="secondary" fullWidth onPress={onClose} />
            </View>
            <View style={styles.actionButton}>
              <Button
                label="Create"
                fullWidth
                loading={isCreating}
                disabled={!canSubmit || isCreating}
                onPress={() => onCreate(parsedBookNumber, parsedSeriesYear)}
              />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

export default function BooksScreen() {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(126);
  const [isCreateSheetVisible, setIsCreateSheetVisible] = useState(false);
  const userProfileQuery = useUserProfile();
  const canManageBooks = canRoleUploadDocuments(userProfileQuery.data?.role);
  const booksQuery = useBooks({ limit: 50, offset: 0 });
  const createBookMutation = useCreateBook();

  const handleCreateBook = async (bookNumber: number, seriesYear: number) => {
    try {
      await createBookMutation.mutateAsync({
        book_number: bookNumber,
        series_year: seriesYear,
      });
      setIsCreateSheetVisible(false);
      toast.success('Register book created');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
        <ScreenHeader
          eyebrow="REGISTER BOOKS"
          title="Books"
          subtitle="Manage legal register volumes and their documents."
          onPressLeft={() => router.back()}
          rightIconName={canManageBooks ? 'add' : undefined}
          rightAccessibilityLabel="Create register book"
          onPressRight={canManageBooks ? () => setIsCreateSheetVisible(true) : undefined}
          onHeightChange={setHeaderHeight}
          includeTopInset
        />

        <FlatList
          data={booksQuery.data ?? []}
          keyExtractor={(book) => book.id}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onPress={() => {
                router.push({
                  pathname: '/books/[id]',
                  params: { id: item.id },
                });
              }}
            />
          )}
          contentContainerStyle={[
            styles.content,
            { paddingTop: headerHeight + HEADER_CONTENT_GAP },
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={booksQuery.isRefetching}
          onRefresh={() => {
            void booksQuery.refetch();
          }}
          ListEmptyComponent={
            booksQuery.isLoading ? (
              <LoadingState message="Loading books..." />
            ) : booksQuery.error ? (
              <ErrorState
                title="Unable to load books"
                message={parseApiError(booksQuery.error).message}
                onRetry={() => {
                  void booksQuery.refetch();
                }}
              />
            ) : (
              <EmptyState
                title="No register books yet"
                message="Create a register book before uploading legal documents."
              />
            )
          }
          ListFooterComponent={<View style={{ height: 18 }} />}
        />

        {canManageBooks ? (
          <View style={styles.footer}>
            <Button
              label="Create book"
              leftIconName="library-books"
              fullWidth
              onPress={() => setIsCreateSheetVisible(true)}
            />
          </View>
        ) : null}
      </View>

      <CreateBookSheet
        visible={isCreateSheetVisible}
        isCreating={createBookMutation.isPending}
        onClose={() => setIsCreateSheetVisible(false)}
        onCreate={handleCreateBook}
      />
    </SafeAreaView>
  );
}
