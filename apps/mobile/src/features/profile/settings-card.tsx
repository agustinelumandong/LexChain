import React from 'react';
import { Text, View } from 'react-native';

import { profileDetailStyles } from './profile-detail.styles';

type SettingsCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <View style={profileDetailStyles.card}>
      <View style={profileDetailStyles.cardHeader}>
        <Text style={profileDetailStyles.cardTitle}>{title}</Text>
        {description ? <Text style={profileDetailStyles.cardDescription}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}
