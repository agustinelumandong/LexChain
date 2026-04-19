import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surface: '#FFFFFF',
  borderSoft: '#D7EBFF',
};

type Metric = {
  label: string;
  value: string;
};

type ProfileMetricsCardProps = {
  metrics: Metric[];
};

export function ProfileMetricsCard({ metrics }: ProfileMetricsCardProps) {
  return (
    <View style={styles.card}>
      {metrics.map((metric, index) => (
        <React.Fragment key={metric.label}>
          <View style={styles.metric}>
            <Text style={styles.value}>{metric.value}</Text>
            <Text style={styles.label}>{metric.label}</Text>
          </View>
          {index < metrics.length - 1 ? <View style={styles.divider} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'stretch',
    shadowColor: '#133B73',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  value: {
    color: COLORS.navy,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.borderSoft,
  },
});
