import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const documentSearchBarColors = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  surface: APP_COLORS.surface,
  inputBorder: '#B9D9FF',
};

export const documentSearchBarStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wrapFocused: {},
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: documentSearchBarColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: documentSearchBarColors.inputBorder,
    paddingHorizontal: 16,
    minHeight: 50,
    shadowColor: '#133B731A',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  inputRowFocused: {
    borderColor: documentSearchBarColors.primary,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  input: {
    flex: 1,
    color: documentSearchBarColors.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
    paddingVertical: 10,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: documentSearchBarColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: documentSearchBarColors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  searchButtonLoading: {
    opacity: 0.7,
  },
  searchButtonDisabled: {
    backgroundColor: documentSearchBarColors.borderSoft,
    shadowOpacity: 0,
    elevation: 0,
  },
});
