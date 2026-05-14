import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export function WebFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.inner}>
        <Text style={styles.brand}>LexChain</Text>
        <Text style={styles.copy}>
          © {new Date().getFullYear()} LexChain. Blockchain-powered document verification.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: APP_COLORS.navy,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  inner: {
    maxWidth: 1120,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  brand: {
    color: APP_COLORS.white,
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '900',
  },
  copy: {
    color: '#A8C4E0',
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '500',
  },
});
