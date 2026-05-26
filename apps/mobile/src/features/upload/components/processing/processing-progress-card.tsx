import { Text, View } from 'react-native';

import { processingScreenStyles as styles } from './processing-screen.styles';

type ProcessingProgressCardProps = {
  isComplete: boolean;
  progressValueLabel: string;
};

export function ProcessingProgressCard({
  isComplete,
  progressValueLabel,
}: ProcessingProgressCardProps) {
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressCopy}>
        <Text style={styles.progressTitle}>
          {isComplete ? 'Document ready' : 'Processing document'}
        </Text>
        <Text style={styles.progressBody}>
          {isComplete
            ? 'All steps finished. Review the draft summary below or head back to Documents.'
            : 'LexChain is extracting document data, scanning the file, and generating the summary.'}
        </Text>
      </View>

      <View style={styles.progressMetaRow}>
        <Text style={styles.progressMetaLabel}>
          {isComplete ? 'Status: Ready for review' : 'Status: Processing in progress'}
        </Text>
        <Text style={styles.progressMetaValue}>{progressValueLabel}</Text>
      </View>
    </View>
  );
}
