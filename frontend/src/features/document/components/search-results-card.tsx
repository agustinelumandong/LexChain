import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const COLORS = {
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.surface,
  primary: APP_COLORS.primary,
};

type SearchResultsCardProps = {
  hits: {
    chunk_id: string;
    chunk_index: number;
    score: number;
    text: string;
  }[];
  onPressHit?: (chunkId: string) => void;
};

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
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Results</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{hits.length} match{hits.length !== 1 ? 'es' : ''}</Text>
        </View>
      </View>

      <View style={styles.results}>
        {hits.map((hit) => (
          <Pressable
            key={hit.chunk_id}
            onPress={() => onPressHit?.(hit.chunk_id)}
            style={({ pressed }) => [
              styles.hitRow,
              pressed && styles.hitRowPressed,
            ]}
          >
            <View style={styles.hitMeta}>
              <Text style={styles.chunkIndex}>Section {hit.chunk_index}</Text>
            </View>

            <Text style={styles.hitText}>
              {hit.text}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
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
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    padding: 16,
    gap: 10,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  hitRowPressed: {
    opacity: 0.85,
  },
  hitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
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
