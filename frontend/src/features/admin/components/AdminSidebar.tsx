import { MaterialIcons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const LINKS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Users', href: '/admin/users', icon: 'group' },
  { label: 'Document Issuers', href: '/admin/document-issuers', icon: 'business' },
  { label: 'Documents', href: '/admin/documents', icon: 'description' },
  { label: 'Categories', href: '/admin/categories', icon: 'category' },
  {
    label: 'Invitations & Permissions',
    href: '/admin/invitations-permissions',
    icon: 'admin-panel-settings',
  },
  { label: 'Verification Logs', href: '/admin/verification-logs', icon: 'verified-user' },
  { label: 'Blockchain Records', href: '/admin/blockchain-records', icon: 'account-tree' },
  { label: 'OCR / NLP Processing', href: '/admin/ocr-nlp-processing', icon: 'document-scanner' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: 'manage-search' },
  { label: 'System Settings', href: '/admin/system-settings', icon: 'settings' },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <View>
        <Text style={styles.brand}>LexChain</Text>
        <Text style={styles.caption}>Super Admin</Text>
      </View>

      <ScrollView contentContainerStyle={styles.nav} showsVerticalScrollIndicator={false}>
        {LINKS.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link key={link.href} href={link.href} asChild>
              <Pressable
                accessibilityRole="link"
                style={[styles.link, isActive && styles.linkActive]}
              >
                <MaterialIcons
                  name={link.icon}
                  size={18}
                  color={isActive ? APP_COLORS.primary : APP_COLORS.textMuted}
                />
                <Text style={[styles.linkText, isActive && styles.linkTextActive]}>
                  {link.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 286,
    gap: 24,
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
    gap: 6,
    paddingBottom: 8,
  },
  link: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
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
