import { Text, View } from 'react-native';

import { processingScreenStyles as styles } from './processing-screen.styles';

export function ProcessingPendingSummaryCard() {
  return (
    <View style={styles.pendingSummaryCard}>
      <Text style={styles.pendingSummaryTitle}>AI Summary Draft</Text>
      <Text style={styles.pendingSummaryBody}>
        Draft summary will appear here as soon as processing finishes.
      </Text>
    </View>
  );
}
