import React from 'react';
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
          console.log(`Loaded ${numberOfPages} pages`);
        }}
      />
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
