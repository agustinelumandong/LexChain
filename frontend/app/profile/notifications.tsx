import React from 'react';
import { toast } from 'sonner-native';

import {
  ProfileDetailScreen,
  SettingToggleRow,
  SettingsCard,
  useProfileSettingsStore,
  type NotificationSettings,
} from '@/features/profile';

type NotificationItem = {
  key: keyof NotificationSettings;
  iconName: React.ComponentProps<typeof SettingToggleRow>['iconName'];
  title: string;
  description: string;
};

const NOTIFICATION_ITEMS: NotificationItem[] = [
  {
    key: 'uploadProcessing',
    iconName: 'upload-file',
    title: 'Upload processing',
    description: 'Notify when documents finish OCR, summary, and indexing.',
  },
  {
    key: 'verificationActivity',
    iconName: 'verified',
    title: 'Verification activity',
    description: 'Notify when document verification status changes.',
  },
  {
    key: 'whitelistChanges',
    iconName: 'admin-panel-settings',
    title: 'Access changes',
    description: 'Notify when whitelist grants are added or revoked.',
  },
  {
    key: 'productSecurity',
    iconName: 'campaign',
    title: 'Product and security notices',
    description: 'Receive important LexChain updates and account protection notices.',
  },
];

export default function NotificationsScreen() {
  const notifications = useProfileSettingsStore((state) => state.notifications);
  const updateNotification = useProfileSettingsStore((state) => state.updateNotification);

  const handleChange = (key: keyof NotificationSettings, value: boolean) => {
    updateNotification(key, value);
    toast.success(value ? 'Notification enabled' : 'Notification disabled');
  };

  return (
    <ProfileDetailScreen
      title="Notifications"
      subtitle="Choose which LexChain activity should alert you."
    >
      <SettingsCard
        title="Activity alerts"
        description="These preferences are stored locally until notification APIs are connected."
      >
        {NOTIFICATION_ITEMS.map((item) => (
          <SettingToggleRow
            key={item.key}
            iconName={item.iconName}
            title={item.title}
            description={item.description}
            value={notifications[item.key]}
            onValueChange={(value) => handleChange(item.key, value)}
          />
        ))}
      </SettingsCard>
    </ProfileDetailScreen>
  );
}
