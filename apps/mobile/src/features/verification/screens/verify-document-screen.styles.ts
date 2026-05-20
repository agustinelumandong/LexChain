import { StyleSheet } from 'react-native';

import { APP_COLORS } from '@/theme';

export const VERIFY_DOCUMENT_HEADER_CONTENT_GAP = 12;

const COLORS = {
  bg: APP_COLORS.bg,
};

export const verifyDocumentScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
