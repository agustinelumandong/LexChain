import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const documentResultCardColors = {
  danger: APP_COLORS.danger,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.surfaceSoft,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
};

export const documentResultCardStyles = StyleSheet.create({
  card: {
    backgroundColor: documentResultCardColors.surface,
    borderRadius: 24,
    padding: 16,
    gap: 10,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    color: documentResultCardColors.navy,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: documentResultCardColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonDanger: {
    backgroundColor: '#FDECEF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaWrap: {
    flex: 1,
    gap: 4,
  },
  meta: {
    color: documentResultCardColors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  registryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  registryPill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: documentResultCardColors.surfaceSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: documentResultCardColors.primary,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  actionButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: documentResultCardColors.primary,
  },
  actionLabel: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  primaryLabel: {
    color: APP_COLORS.white,
  },
});
