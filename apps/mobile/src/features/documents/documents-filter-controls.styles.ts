import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const documentsFilterControlsColors = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  borderSoft: APP_COLORS.borderSoft,
};

export const documentsFilterControlsStyles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    gap: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: documentsFilterControlsColors.borderSoft,
    backgroundColor: documentsFilterControlsColors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  controlButtonLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  controlButtonRight: {
    maxWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  controlButtonLabel: {
    color: documentsFilterControlsColors.navy,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  controlButtonDetail: {
    color: documentsFilterControlsColors.textMuted,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    fontFamily: fonts.regular,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryChip: {
    borderRadius: 999,
    backgroundColor: documentsFilterControlsColors.surfaceSoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  summaryChipText: {
    color: documentsFilterControlsColors.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
});
