import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/ui';

import { profileDetailStyles } from './profile-detail.styles';

export { InfoRow } from './profile-info-row';
export { ProfileTextField } from './profile-text-field';
export { SettingToggleRow } from './setting-toggle-row';
export { SettingsCard } from './settings-card';

const HEADER_CONTENT_GAP = 12;
const DEFAULT_HEADER_HEIGHT = 160;

type ProfileDetailScreenProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function ProfileDetailScreen({
  title,
  subtitle,
  children,
  footer,
}: ProfileDetailScreenProps) {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const handleHeaderHeightChange = useCallback((nextHeight: number) => {
    setHeaderHeight((h) => (h === nextHeight ? h : nextHeight));
  }, []);

  return (
    <SafeAreaView style={profileDetailStyles.screen} edges={['left', 'right', 'bottom']}>
      <ScreenHeader
        eyebrow="PROFILE"
        title={title}
        subtitle={subtitle}
        onPressLeft={() => router.back()}
        onHeightChange={handleHeaderHeightChange}
        includeTopInset
      />

      <ScrollView
        contentContainerStyle={[
          profileDetailStyles.content,
          { paddingTop: headerHeight + HEADER_CONTENT_GAP },
          footer ? profileDetailStyles.contentWithFooter : null,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {footer ? <View style={profileDetailStyles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}
