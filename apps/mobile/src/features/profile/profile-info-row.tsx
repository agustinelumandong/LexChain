import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { profileDetailColors, profileDetailStyles } from './profile-detail.styles';

type InfoRowProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  body: string;
};

export function InfoRow({ iconName, title, body }: InfoRowProps) {
  return (
    <View style={profileDetailStyles.infoRow}>
      <View style={profileDetailStyles.iconWrap}>
        <MaterialIcons name={iconName} size={18} color={profileDetailColors.navy} />
      </View>
      <View style={profileDetailStyles.infoCopy}>
        <Text style={profileDetailStyles.rowTitle}>{title}</Text>
        <Text style={profileDetailStyles.rowDescription}>{body}</Text>
      </View>
    </View>
  );
}
