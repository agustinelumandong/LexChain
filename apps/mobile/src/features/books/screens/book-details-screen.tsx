import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import React, { useCallback, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

import { DocumentResultCard } from '@/features/documents/components/list/document-result-card';
import { DocumentsListSkeleton } from '@/features/documents/components/list/documents-list-skeleton';
import { mapDocumentListItem } from '@/features/documents/utils/document-list-mappers';
import type { DisplayDocument } from '@/features/documents/types/documents-screen.types';
import { useBook, useDocuments } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';
import { APP_COLORS } from '@/theme';
import { EmptyState, ErrorState, ScreenHeader } from '@/ui';

import { booksScreenStyles as styles } from './books-screen.styles';

const HEADER_CONTENT_GAP = 12;

export default function BookDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Array.isArray(id) ? id[0] : id;
  const [headerHeight, setHeaderHeight] = useState(126);
  const isOpeningDocumentRef = useRef(false);
  const bookQuery = useBook(bookId);
  const documentsQuery = useDocuments({ bookId, limit: 50, offset: 0 });
  const documents = (documentsQuery.data ?? []).map(mapDocumentListItem);

  const openDocument = useCallback(
    (documentId: string) => {
      if (isOpeningDocumentRef.current) {
        return;
      }

      isOpeningDocumentRef.current = true;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({
        pathname: '/document/[id]',
        params: { id: documentId },
      });
    },
    [router],
  );

  const renderDocument = useCallback(
    ({ item: document, index }: { item: DisplayDocument; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
        <DocumentResultCard
          title={document.title}
          date={document.date}
          documentNumber={document.documentNumber}
          bookNumber={document.bookNumber}
          pageNumber={document.pageNumber}
          series={document.series}
          onChain={document.onChain}
          onPressCard={() => openDocument(document.id)}
          onPressOpen={() => openDocument(document.id)}
        />
      </Animated.View>
    ),
    [openDocument],
  );

  const bookTitle = bookQuery.data
    ? `Book ${bookQuery.data.book_number}`
    : 'Book details';

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
        <ScreenHeader
          eyebrow="REGISTER BOOK"
          title={bookTitle}
          subtitle={
            bookQuery.data
              ? `Series ${bookQuery.data.series_year} - ${bookQuery.data.document_count} documents`
              : 'Documents assigned to this register book.'
          }
          onPressLeft={() => router.back()}
          onHeightChange={setHeaderHeight}
          includeTopInset
        />

        <FlatList
          data={documentsQuery.isLoading ? [] : documents}
          keyExtractor={(document, index) => `${document.id}-${index}`}
          renderItem={renderDocument}
          contentContainerStyle={[
            styles.content,
            { paddingTop: headerHeight + HEADER_CONTENT_GAP },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={documentsQuery.isRefetching || bookQuery.isRefetching}
              onRefresh={() => {
                void documentsQuery.refetch();
                void bookQuery.refetch();
              }}
              tintColor={APP_COLORS.primary}
              colors={[APP_COLORS.primary]}
              progressBackgroundColor={APP_COLORS.white}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            documentsQuery.isLoading ? (
              <DocumentsListSkeleton />
            ) : documentsQuery.error || bookQuery.error ? (
              <ErrorState
                title="Unable to load book"
                message={parseApiError(documentsQuery.error ?? bookQuery.error).message}
                onRetry={() => {
                  void documentsQuery.refetch();
                  void bookQuery.refetch();
                }}
              />
            ) : (
              <EmptyState
                title="No documents in this book"
                message="Uploaded documents assigned to this register book will appear here."
              />
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
