import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export function OfflineBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>You are offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: APP_COLORS.navy,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: APP_COLORS.white,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
});
