import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const GET_STARTED_COLORS = {
  primary: APP_COLORS.primary,
  primarySoft: '#3AA2FF',
  sky: '#D4ECFF',
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  white: APP_COLORS.white,
  borderSoft: APP_COLORS.borderSoft,
};

export const getStartedScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GET_STARTED_COLORS.white,
  },
  surface: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: GET_STARTED_COLORS.white,
    shadowColor: '#08264D',
    shadowOpacity: 0.38,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -14 },
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 28,
    gap: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: GET_STARTED_COLORS.borderSoft,
  },
  copyBlock: {
    gap: 10,
  },
  title: {
    color: GET_STARTED_COLORS.navy,
    fontSize: 29,
    lineHeight: 33,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  body: {
    color: GET_STARTED_COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: fonts.regular,
    maxWidth: 320,
  },
  actions: {
    gap: 10,
  },
});
