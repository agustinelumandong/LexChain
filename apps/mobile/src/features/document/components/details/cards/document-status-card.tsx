import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';

import { formatUnixTimestamp } from '../../../utils/document-details-formatters';
import { documentDetailCardStyles as styles } from './document-detail-card.styles';

export function DocumentStatusCard({
  anchoredAt,
  isAnchorTimeLoading,
  onChain,
  onPress,
}: {
  anchoredAt?: number;
  isAnchorTimeLoading?: boolean;
  onChain?: boolean;
  onPress?: () => void;
}) {
  const statusBody = onChain
    ? 'This document hash has been recorded on-chain and can be independently verified.'
    : 'This document is not yet recorded on-chain.';
  const chainTimeLabel = onChain
    ? isAnchorTimeLoading
      ? 'Checking chain time'
      : anchoredAt
        ? `Anchored ${formatUnixTimestamp(anchoredAt)}`
        : 'Anchored on-chain'
    : 'Not anchored yet';
  const textColor = onChain ? APP_COLORS.primary : APP_COLORS.danger;
  const shadowStyle = onChain
    ? {
        shadowColor: APP_COLORS.navy,
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        boxShadow: '0px 4px 16px rgba(19, 59, 115, 0.06)',
      }
    : {
        shadowColor: APP_COLORS.danger,
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        boxShadow: '0px 4px 16px rgba(217, 75, 102, 0.12)',
      };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.statusCard,
        shadowStyle,
        onPress && pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Blockchain status card"
    >
      <View
        style={[
          styles.cardIconBubble,
          { backgroundColor: onChain ? APP_COLORS.surfaceSoft : '#FDECEF' },
        ]}
      >
        <MaterialIcons name="verified-user" size={24} color={textColor} />
      </View>

      <View style={styles.statusCopy}>
        <Text style={[styles.statusTitle, { marginBottom: 4 }]}>Blockchain status</Text>
        <Text style={styles.statusBody}>{statusBody}</Text>
        <Text style={[styles.accessCount, { color: textColor }]}>{chainTimeLabel}</Text>
      </View>

      {onPress ? (
        <MaterialIcons name="chevron-right" size={24} color={APP_COLORS.textMuted} />
      ) : null}
    </Pressable>
  );
}

