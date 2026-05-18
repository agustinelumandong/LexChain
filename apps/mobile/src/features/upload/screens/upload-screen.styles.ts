import { StyleSheet } from 'react-native';

import { APP_COLORS } from '@/theme';

export const uploadScreenColors = {
  bg: APP_COLORS.bg,
  primary: APP_COLORS.primary,
  white: APP_COLORS.white,
  textMuted: APP_COLORS.textMuted,
  navy: APP_COLORS.navy,
  borderSoft: APP_COLORS.borderSoft,
};

export const uploadScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uploadScreenColors.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: uploadScreenColors.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    alignItems: 'center',
  },
  footerActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  uploadButtonWrap: {
    flex: 1,
    maxWidth: 252,
  },
  cameraFab: {
    width: 62,
    height: 62,
    borderRadius: 24,
    backgroundColor: uploadScreenColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APP_COLORS.primary,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  titleInputContainer: {
    gap: 8,
  },
  titleInputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: uploadScreenColors.navy,
  },
  titleInput: {
    backgroundColor: uploadScreenColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: uploadScreenColors.borderSoft,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: uploadScreenColors.navy,
  },
});
