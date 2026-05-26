import { MaterialIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { documentResultCardColors, documentResultCardStyles } from './document-result-card.styles';

type DocumentResultCardProps = {
  title: string;
  date: string;
  onChain?: boolean;
  onPressCard?: () => void;
  onPressOpen?: () => void;
  onPressMore?: () => void;
};

export const DocumentResultCard = memo(function DocumentResultCard({
  title,
  date,
  onChain,
  onPressCard,
  onPressOpen,
  onPressMore,
}: DocumentResultCardProps) {
  const shieldColor = onChain
    ? documentResultCardColors.primary
    : documentResultCardColors.danger;
  const shieldBubbleStyle = onChain
    ? documentResultCardStyles.moreButton
    : [documentResultCardStyles.moreButton, documentResultCardStyles.moreButtonDanger];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPressCard}
      style={({ pressed }) => [
        documentResultCardStyles.card,
        pressed && documentResultCardStyles.cardPressed,
      ]}
    >
      <View style={documentResultCardStyles.headerRow}>
        <Text style={documentResultCardStyles.title}>{title}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={onPressMore}
          style={shieldBubbleStyle}
        >
          <MaterialIcons name="shield" size={18} color={shieldColor} />
        </Pressable>
      </View>

      <View style={documentResultCardStyles.metaRow}>
        <View style={documentResultCardStyles.metaWrap}>
          <Text style={documentResultCardStyles.meta}>Date: {date}</Text>
        </View>

        <Pressable style={[documentResultCardStyles.actionButton, documentResultCardStyles.primaryButton]} onPress={onPressOpen}>
          <Text style={[documentResultCardStyles.actionLabel, documentResultCardStyles.primaryLabel]}>Open</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});
