import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';

import { formatUnixTimestamp } from '../../../utils/document-details-formatters';
import { documentDetailCardStyles as styles } from './document-detail-card.styles';

export function DocumentStatusCard({
  anchoredAt,
  isAnchorTimeLoading,
  onChain,
}: {
  anchoredAt?: number;
  isAnchorTimeLoading?: boolean;
  onChain?: boolean;
}) {
  const statusLabel = onChain ? 'Anchored' : 'Not anchored';
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
  const iconColor = onChain ? APP_COLORS.primary : APP_COLORS.danger;
  const statusPillStyle = onChain
    ? styles.statusPill
    : [styles.statusPill, { backgroundColor: '#FDECEF', color: APP_COLORS.danger }];

  return (
    <View style={styles.statusCard}>
      <View
        style={[
          styles.cardIconBubble,
          { backgroundColor: onChain ? APP_COLORS.surfaceSoft : '#FDECEF' },
        ]}
      >
        <MaterialIcons name="verified-user" size={24} color={iconColor} />
      </View>

      <View style={styles.statusCopy}>
        <Text style={styles.statusTitle}>Blockchain status</Text>
        <Text style={styles.statusBody}>{statusBody}</Text>
        <Text style={styles.accessCount}>{chainTimeLabel}</Text>
      </View>

      <Text style={statusPillStyle}>{statusLabel}</Text>
    </View>
  );
}
