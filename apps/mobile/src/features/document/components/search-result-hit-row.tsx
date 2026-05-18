import { Pressable, Text, View } from 'react-native';

import { searchResultsCardStyles } from './search-results-card.styles';

export type SearchResultHit = {
  chunk_id: string;
  chunk_index: number;
  score: number;
  text: string;
};

type SearchResultHitRowProps = {
  hit: SearchResultHit;
  onPress?: () => void;
};

export function SearchResultHitRow({
  hit,
  onPress,
}: SearchResultHitRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        searchResultsCardStyles.hitRow,
        pressed && searchResultsCardStyles.hitRowPressed,
      ]}
    >
      <View style={searchResultsCardStyles.hitMeta}>
        <Text style={searchResultsCardStyles.chunkIndex}>Section {hit.chunk_index}</Text>
      </View>

      <Text style={searchResultsCardStyles.hitText}>
        {hit.text}
      </Text>
    </Pressable>
  );
}
