import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export function WebNavbar() {
  return (
    <View style={styles.nav}>
      <View style={styles.inner}>
        <Text style={styles.brand}>LexChain</Text>
        <View style={styles.links}>
          <Link href="/public/verify" asChild>
            <Pressable style={styles.navLink}>
              <Text style={styles.navLinkText}>Verify Document</Text>
            </Pressable>
          </Link>
          <Link href="/admin/login" asChild>
            <Pressable style={styles.navButton}>
              <Text style={styles.navButtonText}>Admin Login</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: APP_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.borderSoft,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inner: {
    maxWidth: 1120,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 22,
    fontWeight: '900',
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navLink: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  navLinkText: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '700',
  },
  navButton: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  navButtonText: {
    color: APP_COLORS.white,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '700',
  },
});
