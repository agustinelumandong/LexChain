import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  primary: '#1689F5',
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surface: '#FFFFFF',
  borderSoft: '#D7EBFF',
  success: '#1689F5',
};

type StepStatus = 'done' | 'verifying' | 'pending';

type VerificationStep = {
  label: string;
  status: StepStatus;
};

type VerificationStatusCardProps = {
  title: string;
  steps: VerificationStep[];
};

const STATUS_COPY: Record<StepStatus, string> = {
  done: 'Done',
  verifying: 'Verifying',
  pending: 'Pending',
};

export function VerificationStatusCard({
  title,
  steps,
}: VerificationStatusCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.stepsWrap}>
        {steps.map((step, index) => (
          <View key={step.label} style={styles.stepRow}>
            <View style={styles.stepLead}>
              <View
                style={[
                  styles.dot,
                  step.status === 'done' && styles.dotDone,
                  step.status === 'verifying' && styles.dotVerifying,
                ]}
              />
              {index < steps.length - 1 ? <View style={styles.line} /> : null}
            </View>

            <View style={styles.stepBody}>
              <Text style={styles.stepLabel}>{step.label}</Text>
              <Text
                style={[
                  styles.stepStatus,
                  step.status === 'done' && styles.stepStatusDone,
                  step.status === 'verifying' && styles.stepStatusVerifying,
                ]}
              >
                {STATUS_COPY[step.status]}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    gap: 16,
    shadowColor: '#133B73',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  stepsWrap: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepLead: {
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: COLORS.borderSoft,
  },
  dotDone: {
    backgroundColor: COLORS.success,
  },
  dotVerifying: {
    backgroundColor: COLORS.primary,
  },
  line: {
    width: 1,
    flex: 1,
    minHeight: 28,
    marginTop: 4,
    backgroundColor: COLORS.borderSoft,
  },
  stepBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 8,
  },
  stepLabel: {
    flex: 1,
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  stepStatus: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  stepStatusDone: {
    color: COLORS.primary,
  },
  stepStatusVerifying: {
    color: COLORS.primary,
  },
});
