import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { APP_COLORS } from '@/theme';

import { documentDetailCardStyles as styles } from './document-detail-card.styles';

export function ConfidenceCard({ isReady }: { isReady: boolean }) {
  return (
    <View style={styles.confidenceCard}>
      <View style={styles.cardIconBubble}>
        <MaterialIcons name="verified" size={24} color={APP_COLORS.primary} />
      </View>
      <View style={styles.statusCopy}>
        <Text style={styles.statusTitle}>Summary confidence</Text>
        <Text style={styles.statusBody}>AI-generated summary reliability</Text>
      </View>
      <Text style={styles.confidencePill}>{isReady ? 'High' : 'Pending'}</Text>
    </View>
  );
}
