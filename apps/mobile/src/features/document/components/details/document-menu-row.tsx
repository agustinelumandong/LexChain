import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

type DocumentMenuRowProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  description: string;
  onPress: () => void;
};

export function DocumentMenuRow({
  iconName,
  title,
  description,
  onPress,
}: DocumentMenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
      onPress={onPress}
    >
      <View style={styles.rowIcon}>
        <MaterialIcons name={iconName} size={20} color={APP_COLORS.primary} />
      </View>

      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>

      <MaterialIcons name="chevron-right" size={20} color={APP_COLORS.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuRowPressed: {
    opacity: 0.72,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: APP_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: APP_COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
  },
  rowDescription: {
    color: APP_COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
