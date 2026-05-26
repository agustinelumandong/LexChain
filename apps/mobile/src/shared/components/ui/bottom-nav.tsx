import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, View } from 'react-native';

import { BottomNavItem } from './bottom-nav-item';
import { bottomNavColors, bottomNavStyles as styles } from './bottom-nav.styles';

type NavTab = 'home' | 'documents' | 'profile';

type BottomNavProps = {
  activeTab: NavTab;
  onPressHome: () => void;
  onPressDocuments: () => void;
  onPressProfile: () => void;
  onPressUpload: () => void;
  showUpload?: boolean;
};

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
        <BottomNavItem
          active={activeTab === 'home'}
          iconName="home-filled"
          label={activeTab === 'home' ? 'Home' : undefined}
          onPress={onPressHome}
        />

        <BottomNavItem
          active={activeTab === 'documents'}
          iconName="description"
          label={activeTab === 'documents' ? 'Documents' : undefined}
          onPress={onPressDocuments}
        />

        <BottomNavItem
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
          <MaterialIcons name="upload" size={22} color={bottomNavColors.surface} />
        </Pressable>
      )}
    </View>
  );
};
