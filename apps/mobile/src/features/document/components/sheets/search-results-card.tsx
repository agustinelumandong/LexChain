import React, { memo } from 'react';
import { Text, View } from 'react-native';

import { SearchResultHitRow, type SearchResultHit } from './search-result-hit-row';
import { searchResultsCardStyles } from './search-results-card.styles';

type SearchResultsCardProps = {
  hits: SearchResultHit[];
  onPressHit?: (chunkId: string) => void;
};

export const SearchResultsCard = memo(function SearchResultsCard({
  hits,
  onPressHit,
}: SearchResultsCardProps) {
  if (hits.length === 0) {
    return (
      <View style={searchResultsCardStyles.emptyCard}>
        <Text style={searchResultsCardStyles.emptyText}>No matches found in this document.</Text>
      </View>
    );
  }

  return (
    <View style={searchResultsCardStyles.wrap}>
      <View style={searchResultsCardStyles.header}>
        <Text style={searchResultsCardStyles.title}>Search Results</Text>
        <View style={searchResultsCardStyles.badge}>
          <Text style={searchResultsCardStyles.badgeText}>{hits.length} match{hits.length !== 1 ? 'es' : ''}</Text>
        </View>
      </View>

      <View style={searchResultsCardStyles.results}>
        {hits.map((hit) => (
          <SearchResultHitRow
            key={hit.chunk_id}
            hit={hit}
            onPress={() => onPressHit?.(hit.chunk_id)}
          />
        ))}
      </View>
    </View>
  );
});
