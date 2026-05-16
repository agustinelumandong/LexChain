import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.surface,
  surfaceSoft: APP_COLORS.surfaceSoft,
};

type NavTab = 'home' | 'documents' | 'profile';

type BottomNavProps = {
  activeTab: NavTab;
  onPressHome: () => void;
  onPressDocuments: () => void;
  onPressProfile: () => void;
  onPressUpload: () => void;
  showUpload?: boolean;
};

type NavItemProps = {
  active?: boolean;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  label?: string;
  onPress: () => void;
};

function NavItem({ active = false, iconName, label, onPress }: NavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.navItem, active && styles.navItemActive]}
      accessibilityRole="button"
    >
      <MaterialIcons
        name={iconName}
        size={18}
        color={active ? COLORS.primary : COLORS.textMuted}
      />
      {label ? (
        <Text
          style={[
            styles.navLabel,
            active && styles.navLabelActive,
          ]}
        >
          {label}
        </Text>
      ): null}
    </Pressable>
  );
}

export function BottomNav({
  activeTab,
  onPressHome,
  onPressDocuments,
  onPressProfile,
  onPressUpload,
  showUpload = false,
}: BottomNavProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.navBar}>
        <NavItem
          active={activeTab === 'home'}
          iconName="home-filled"
          label={activeTab === 'home' ? 'Home' : undefined}
          onPress={onPressHome}
        />

        <NavItem
          active={activeTab === 'documents'}
          iconName="description"
          label={activeTab === 'documents' ? 'Documents' : undefined}
          onPress={onPressDocuments}
        />

        <NavItem
          active={activeTab === 'profile'}
          iconName="person"
          label={activeTab === 'profile' ? 'Profile' : undefined}
          onPress={onPressProfile}
        />
      </View>

      {showUpload && (
        <Pressable
          onPress={onPressUpload}
          style={styles.fab}
          accessibilityRole="button"
        >
          <MaterialIcons name="upload" size={22} color={COLORS.surface} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navBar: {
    flex: 1,
    minHeight: 62,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    gap: 4,
    shadowColor: APP_COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  navItem: {
    flex: 1,
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 3,
  },
  navItemActive: {
    backgroundColor: COLORS.surfaceSoft,
  },
  navLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  navLabelActive: {
    color: COLORS.primary,
  },
  fab: {
    width: 62,
    height: 62,
    flexShrink: 0,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APP_COLORS.primary,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
});
