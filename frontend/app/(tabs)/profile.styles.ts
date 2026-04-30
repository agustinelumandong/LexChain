import { StyleSheet } from 'react-native';

import { APP_COLORS } from '@/theme';

const COLORS = {
  bg: APP_COLORS.bg,
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },
  sessionCard: {
    borderRadius: 24,
  },
  navWrap: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
