import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/ui/button';

const COLORS = {
  navy: '#133B73',
  textMuted: '#6F8FB5',
  surface: '#FFFFFF',
};

type AiSummaryDraftCardProps = {
  source: string;
  confidence: string;
  summary: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPressReviewSummary?: () => void;
  onPressOpenDoc?: () => void;
};

export function AiSummaryDraftCard({
  source,
  confidence,
  summary,
  primaryActionLabel = 'Review Summary',
  secondaryActionLabel = 'Open Doc',
  onPressReviewSummary,
  onPressOpenDoc,
}: AiSummaryDraftCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>AI Summary Draft</Text>

      <View style={styles.metaBlock}>
        <Text style={styles.meta}>Source: {source}</Text>
        <Text style={styles.meta}>Confidence: {confidence}</Text>
        <Text style={styles.summary}>{summary}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionSlot}>
          <Button
            label={primaryActionLabel}
            size="md"
            fullWidth
            onPress={onPressReviewSummary}
          />
        </View>

        <View style={styles.actionSlot}>
          <Button
            label={secondaryActionLabel}
            variant="secondary"
            size="md"
            fullWidth
            onPress={onPressOpenDoc}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    gap: 12,
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
  metaBlock: {
    gap: 6,
  },
  meta: {
    color: COLORS.textMuted,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  summary: {
    color: COLORS.navy,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionSlot: {
    flex: 1,
  },
});
