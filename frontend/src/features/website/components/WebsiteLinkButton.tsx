import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

type WebsiteLinkButtonProps = {
  href: Href;
  label: string;
  variant?: 'primary' | 'secondary';
};

export function WebsiteLinkButton({
  href,
  label,
  variant = 'primary',
}: WebsiteLinkButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        style={[
          styles.button,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
        ]}
      >
        <Text style={[styles.label, isPrimary ? styles.primaryText : styles.secondaryText]}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: APP_COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: APP_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSoft,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryText: {
    color: APP_COLORS.white,
  },
  secondaryText: {
    color: APP_COLORS.primary,
  },
});
