import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Pdf from 'react-native-pdf';

import { APP_COLORS, fonts } from '@/theme';

type LexChainPdfViewerProps = {
  uri?: string | null;
};

const COLORS = {
  borderSoft: APP_COLORS.borderSoft,
  navy: APP_COLORS.navy,
  surfaceSoft: APP_COLORS.surfaceSoft,
  textMuted: APP_COLORS.textMuted,
  white: APP_COLORS.white,
};

export function LexChainPdfViewer({ uri }: LexChainPdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  if (!uri) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <Text style={styles.emptyTitle}>PDF source unavailable</Text>
        <Text style={styles.emptyText}>
          The viewer is ready, but this document does not expose a PDF URL yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri, cache: true }}
        style={styles.pdf}
        trustAllCerts={false}
        renderActivityIndicator={() => (
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading document...</Text>
          </View>
        )}
        onError={(error) => {
          console.log('PDF error:', error);
        }}
        onLoadComplete={(numberOfPages) => {
          setCurrentPage(1);
          setPageCount(numberOfPages);
          console.log(`Loaded ${numberOfPages} pages`);
        }}
        onPageChanged={(page, numberOfPages) => {
          setCurrentPage(page);
          setPageCount(numberOfPages);
        }}
      />
      {pageCount > 0 ? (
        <View pointerEvents="none" style={styles.pagePill}>
          <Text style={styles.pagePillText}>
            Page {currentPage} / {pageCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.white,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.white,
  },
  pagePill: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  pagePillText: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 15,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceSoft,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.surfaceSoft,
  },
  emptyTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
