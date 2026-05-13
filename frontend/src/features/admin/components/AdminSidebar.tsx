import { Link, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const LINKS = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Documents', href: '/admin/documents' },
  { label: 'Verifications', href: '/admin/verifications' },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <View>
        <Text style={styles.brand}>LexChain</Text>
        <Text style={styles.caption}>Super Admin</Text>
      </View>

      <View style={styles.nav}>
        {LINKS.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link key={link.href} href={link.href} asChild>
            <Pressable
              accessibilityRole="link"
              style={[styles.link, isActive && styles.linkActive]}
            >
              <Text style={[styles.linkText, isActive && styles.linkTextActive]}>
                {link.label}
              </Text>
            </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 230,
    gap: 28,
    borderRightWidth: 1,
    borderRightColor: APP_COLORS.borderSoft,
    backgroundColor: APP_COLORS.white,
    padding: 22,
  },
  brand: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },
  caption: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  nav: {
    gap: 8,
  },
  link: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  linkActive: {
    backgroundColor: APP_COLORS.surfaceSoft,
  },
  linkText: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  linkTextActive: {
    color: APP_COLORS.primary,
  },
});
