import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.white,
  borderSoft: APP_COLORS.borderSoft,
};

type SettingsItem = {
  label: string;
  description: string;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  onPress?: () => void;
};

type SettingsListCardProps = {
  title: string;
  items: SettingsItem[];
};

export function SettingsListCard({ title, items }: SettingsListCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          <Pressable
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.itemLead}>
              <View style={styles.iconWrap}>
                <MaterialIcons name={item.iconName} size={18} color={COLORS.navy} />
              </View>

              <View style={styles.itemCopy}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
            </View>

            <MaterialIcons name="chevron-right" size={18} color={COLORS.textMuted} />
          </Pressable>

          {index < items.length - 1 ? <View style={styles.divider} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    color: COLORS.navy,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  itemLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#F7FBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: {
    flex: 1,
    gap: 3,
  },
  itemLabel: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  itemDescription: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderSoft,
  },
});
