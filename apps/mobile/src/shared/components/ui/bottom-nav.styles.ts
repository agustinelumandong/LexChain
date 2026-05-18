import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const bottomNavColors = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.surface,
  surfaceSoft: APP_COLORS.surfaceSoft,
};

export const bottomNavStyles = StyleSheet.create({
  wrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navBar: {
    flex: 1,
    minHeight: 62,
    borderRadius: 30,
    backgroundColor: bottomNavColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    gap: 4,
    shadowColor: APP_COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  navItem: {
    flex: 1,
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 3,
  },
  navItemActive: {
    backgroundColor: bottomNavColors.surfaceSoft,
  },
  navLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: bottomNavColors.textMuted,
  },
  navLabelActive: {
    color: bottomNavColors.primary,
  },
  fab: {
    width: 62,
    height: 62,
    flexShrink: 0,
    borderRadius: 24,
    backgroundColor: bottomNavColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APP_COLORS.primary,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
});
