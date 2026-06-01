import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Text, View } from 'react-native';

import {
  profileSummaryCardColors,
  profileSummaryCardStyles,
} from './profile-summary-card.styles';

type ProfileSummaryInfoRowProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  value: string;
};

export function ProfileSummaryInfoRow({
  iconName,
  value,
}: ProfileSummaryInfoRowProps) {
  return (
    <View style={profileSummaryCardStyles.infoRow}>
      <MaterialIcons name={iconName} size={16} color={profileSummaryCardColors.textMuted} />
      <Text style={profileSummaryCardStyles.infoText}>{value}</Text>
    </View>
  );
}
