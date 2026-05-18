import { Text, View } from 'react-native';

import { profileSummaryCardStyles } from './profile-summary-card.styles';

export function ProfileSummaryStatusChip() {
  return (
    <View style={profileSummaryCardStyles.statusChip}>
      <Text style={profileSummaryCardStyles.statusChipText}>Verified member</Text>
    </View>
  );
}
