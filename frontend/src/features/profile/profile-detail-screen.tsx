import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/ui';
import { APP_COLORS, fonts } from '@/theme';

type ProfileDetailScreenProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

type SettingsCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

type ProfileTextFieldProps = TextInputProps & {
  label: string;
};

type SettingToggleRowProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

type InfoRowProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  body: string;
};

const COLORS = {
  bg: APP_COLORS.bg,
  surface: APP_COLORS.white,
  surfaceSoft: '#F7FBFF',
  borderSoft: APP_COLORS.borderSoft,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
};

export function ProfileDetailScreen({
  title,
  subtitle,
  children,
  footer,
}: ProfileDetailScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader
        eyebrow="PROFILE"
        title={title}
        subtitle={subtitle}
        onPressLeft={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[styles.content, footer ? styles.contentWithFooter : null]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {description ? <Text style={styles.cardDescription}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function ProfileTextField({ label, style, ...props }: ProfileTextFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={COLORS.textMuted}
        style={[styles.fieldInput, style]}
      />
    </View>
  );
}

export function SettingToggleRow({
  iconName,
  title,
  description,
  value,
  onValueChange,
}: SettingToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
      onPress={() => onValueChange(!value)}
    >
      <View style={styles.toggleLead}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={iconName} size={18} color={COLORS.navy} />
        </View>
        <View style={styles.toggleCopy}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowDescription}>{description}</Text>
        </View>
      </View>

      <View style={[styles.switchTrack, value && styles.switchTrackActive]}>
        <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
      </View>
    </Pressable>
  );
}

export function InfoRow({ iconName, title, body }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={iconName} size={18} color={COLORS.navy} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 16,
  },
  contentWithFooter: {
    paddingBottom: 112,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    gap: 4,
  },
  cardTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  cardDescription: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  fieldWrap: {
    gap: 7,
  },
  fieldLabel: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
  },
  fieldInput: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surfaceSoft,
    paddingHorizontal: 14,
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 2,
  },
  toggleLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCopy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  rowDescription: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#DDE7F2',
    padding: 3,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: COLORS.primary,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCopy: {
    flex: 1,
    gap: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },
});
