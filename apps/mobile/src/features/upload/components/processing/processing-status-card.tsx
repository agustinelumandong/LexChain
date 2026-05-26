import { Text, View } from 'react-native';

import { processingScreenStyles as styles } from './processing-screen.styles';

type ProcessingStatusStep = {
  label: string;
  value: string;
  status: 'done' | 'active' | 'pending';
};

type ProcessingStatusCardProps = {
  statusSteps: ProcessingStatusStep[];
};

export function ProcessingStatusCard({ statusSteps }: ProcessingStatusCardProps) {
  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusTitle}>Processing status</Text>

      <View style={styles.stepsWrap}>
        {statusSteps.map((step, index) => (
          <View key={step.label} style={styles.stepRow}>
            <View style={styles.stepLead}>
              <View
                style={[
                  styles.dot,
                  step.status === 'done' && styles.dotDone,
                  step.status === 'active' && styles.dotActive,
                ]}
              />
              {index < statusSteps.length - 1 ? <View style={styles.line} /> : null}
            </View>

            <View style={styles.stepBody}>
              <Text
                style={[
                  styles.stepLabel,
                  step.status === 'pending' && styles.stepLabelPending,
                ]}
              >
                {step.label}
              </Text>
              <Text
                style={[
                  styles.stepValue,
                  step.status === 'done' && styles.stepValueDone,
                  step.status === 'active' && styles.stepValueActive,
                ]}
              >
                {step.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
