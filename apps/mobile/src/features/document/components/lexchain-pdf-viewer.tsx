import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

type LexChainPdfViewerProps = {
  uri?: string | null;
};

const COLORS = {
  borderSoft: APP_COLORS.borderSoft,
  navy: APP_COLORS.navy,
  surfaceSoft: APP_COLORS.surfaceSoft,
  textMuted: APP_COLORS.textMuted,
};

export function LexChainPdfViewer({ uri }: LexChainPdfViewerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PDF viewer needs a development build</Text>
      <Text style={styles.text}>
        {uri
          ? 'This route is wired for native PDF viewing. Run the app with an Expo development build to render the document.'
          : 'The viewer is ready, but this document does not expose a PDF URL yet.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surfaceSoft,
  },
  title: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'center',
  },
  text: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
