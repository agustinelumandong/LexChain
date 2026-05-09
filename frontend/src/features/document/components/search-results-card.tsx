import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const COLORS = {
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.surface,
  surfaceSoft: APP_COLORS.surfaceSoft,
  primary: APP_COLORS.primary,
  success: APP_COLORS.success,
};

type SearchResultsCardProps = {
  hits: Array<{
    chunk_id: string;
    chunk_index: number;
    score: number;
    text: string;
  }>;
  onPressHit?: (chunkId: string) => void;
};

function getScoreLabel(score: number): string {
  if (score >= 0.9) return 'High';
  if (score >= 0.7) return 'Good';
  if (score >= 0.5) return 'Low';
  return 'Weak';
}

function getScoreColor(score: number): string {
  if (score >= 0.9) return COLORS.success;
  if (score >= 0.7) return COLORS.primary;
  return COLORS.textMuted;
}

export const SearchResultsCard = memo(function SearchResultsCard({
  hits,
  onPressHit,
}: SearchResultsCardProps) {
  if (hits.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No matches found in this document.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Results</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{hits.length} match{hits.length !== 1 ? 'es' : ''}</Text>
        </View>
      </View>

      <View style={styles.results}>
        {hits.map((hit) => {
          const scoreLabel = getScoreLabel(hit.score);
          const scoreColor = getScoreColor(hit.score);

          return (
            <Pressable
              key={hit.chunk_id}
              onPress={() => onPressHit?.(hit.chunk_id)}
              style={({ pressed }) => [
                styles.hitRow,
                pressed && styles.hitRowPressed,
              ]}
            >
              <View style={styles.hitMeta}>
                <View style={[styles.scorePill, { backgroundColor: `${scoreColor}20` }]}>
                  <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
                </View>
                <Text style={styles.chunkIndex}>#{hit.chunk_index}</Text>
              </View>

              <Text style={styles.hitText} numberOfLines={3}>
                {hit.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  results: {
    gap: 12,
  },
  hitRow: {
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSoft,
    padding: 14,
    gap: 8,
  },
  hitRowPressed: {
    opacity: 0.85,
  },
  hitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scorePill: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  scoreLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },
  chunkIndex: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
  hitText: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});