import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const selectDropdownFieldColors = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  surface: APP_COLORS.surface,
};

export const selectDropdownFieldStyles = StyleSheet.create({
  wrap: {
    gap: 10,
    zIndex: 10,
    position: 'relative',
  },
  label: {
    color: selectDropdownFieldColors.navy,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  field: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: selectDropdownFieldColors.borderSoft,
    backgroundColor: selectDropdownFieldColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  fieldActive: {
    borderColor: selectDropdownFieldColors.primary,
    backgroundColor: '#F7FBFF',
  },
  fieldPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  value: {
    color: selectDropdownFieldColors.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  valueActive: {
    color: selectDropdownFieldColors.primary,
  },
  dropdownList: {
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: selectDropdownFieldColors.borderSoft,
    backgroundColor: selectDropdownFieldColors.surface,
    shadowColor: '#133B731A',
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
    zIndex: 20,
  },
  outsideOverlay: {
    position: 'absolute',
    top: -2000,
    right: -2000,
    bottom: -2000,
    left: -2000,
    zIndex: 15,
  },
  optionRow: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionRowSelected: {
    backgroundColor: APP_COLORS.surfaceSoft,
  },
  optionRowPressed: {
    opacity: 0.85,
  },
  optionLabel: {
    color: selectDropdownFieldColors.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  optionLabelSelected: {
    color: selectDropdownFieldColors.primary,
  },
});
