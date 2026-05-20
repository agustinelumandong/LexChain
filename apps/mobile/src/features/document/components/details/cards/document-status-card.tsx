import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';

import { formatDate, formatStatusLabel } from '../../../utils/document-details-formatters';
import { documentDetailCardStyles as styles } from './document-detail-card.styles';

export function DocumentStatusCard({
  status,
  uploadedAt,
  onChain,
}: {
  status: string;
  uploadedAt: string;
  onChain?: boolean;
}) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.cardIconBubble}>
        <MaterialIcons name="verified-user" size={24} color={APP_COLORS.primary} />
      </View>

      <View style={styles.statusCopy}>
        <Text style={styles.statusTitle}>Verification</Text>
        <Text style={styles.statusBody}>Last updated {formatDate(uploadedAt)}</Text>
        {onChain ? (
          <Text style={[styles.statusBody, { color: APP_COLORS.success, fontWeight: '600', marginTop: 2 }]}>
            ✓ Anchored to Blockchain
          </Text>
        ) : (
          <Text style={[styles.statusBody, { color: APP_COLORS.textMuted, marginTop: 2 }]}>
            Not yet anchored
          </Text>
        )}
      </View>

      <Text style={styles.statusPill}>{formatStatusLabel(status)}</Text>
    </View>
  );
}
