import { StyleSheet } from 'react-native';

import { APP_COLORS } from '@/theme';

export const documentMenuScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: APP_COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  separator: {
    height: 1,
    marginLeft: 72,
    backgroundColor: APP_COLORS.borderSoft,
  },
});
