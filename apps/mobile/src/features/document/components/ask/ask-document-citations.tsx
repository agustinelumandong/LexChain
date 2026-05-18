import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { AskCitation } from '../types/ask-document-card.types';
import {
  ASK_DOCUMENT_CARD_COLORS as COLORS,
  askDocumentCardStyles as styles,
} from './ask-document-card.styles';

type AskDocumentCitationsProps = {
  citations: AskCitation[];
};

export function AskDocumentCitations({ citations }: AskDocumentCitationsProps) {
  return (
    <View style={styles.citationsSection}>
      <View style={styles.citationsHeader}>
        <MaterialIcons name="format-quote" size={14} color={COLORS.success} />
        <Text style={styles.citationsLabel}>
          {citations.length} citation{citations.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <View style={styles.citationsList}>
        {citations.map((citation, index) => (
          <View key={citation.chunk_id} style={styles.citationRow}>
            <View style={styles.citationIndex}>
              <Text style={styles.citationIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.citationMeta}>
              <Text style={styles.chunkIndex}>#{citation.chunk_index}</Text>
              <Text style={styles.citationScore}>
                {Math.round(citation.score * 100)}% match
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
