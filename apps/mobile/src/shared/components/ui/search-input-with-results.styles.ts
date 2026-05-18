import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const searchInputWithResultsColors = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  surface: APP_COLORS.surface,
  inputBorder: '#B9D9FF',
};

export const searchInputWithResultsStyles = StyleSheet.create({
  wrap: {
    gap: 6,
    zIndex: 20,
  },
  label: {
    color: searchInputWithResultsColors.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  anchor: {
    position: 'relative',
  },
  inputWrap: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: searchInputWithResultsColors.inputBorder,
    backgroundColor: searchInputWithResultsColors.surface,
    shadowColor: '#133B731A',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  inputWrapActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  input: {
    flex: 1,
    color: searchInputWithResultsColors.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
    shadowColor: '#133B731A',
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
    zIndex: 30,
  },
  emptyState: {
    backgroundColor: searchInputWithResultsColors.surface,
    borderWidth: 1,
    borderColor: searchInputWithResultsColors.borderSoft,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: searchInputWithResultsColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
});
