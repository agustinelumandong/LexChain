import { StyleSheet } from 'react-native';

import { APP_COLORS } from '@/theme';

export const verifyDocumentBottomSheetColors = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  borderSoft: APP_COLORS.borderSoft,
};

export const verifyDocumentBottomSheetStyles = StyleSheet.create({
  backdrop: {
    backgroundColor: verifyDocumentBottomSheetColors.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: verifyDocumentBottomSheetColors.sheet,
    borderWidth: 1,
    borderColor: verifyDocumentBottomSheetColors.borderSoft,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: verifyDocumentBottomSheetColors.borderSoft,
    marginTop: 10,
    marginBottom: 8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 20,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: verifyDocumentBottomSheetColors.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
});
