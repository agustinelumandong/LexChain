import { Text, View } from 'react-native';

import { askDocumentCardStyles as styles } from './ask-document-card.styles';

type AskDocumentAnswerProps = {
  answer: string;
  model?: string;
};

export function AskDocumentAnswer({ answer, model }: AskDocumentAnswerProps) {
  return (
    <View style={styles.answerSection}>
      <View style={styles.answerMeta}>
        <Text style={styles.answerLabel}>Answer</Text>
        {model ? <Text style={styles.modelBadge}>{model}</Text> : null}
      </View>
      <View style={styles.answerBox}>
        <Text style={styles.answerText}>{answer}</Text>
      </View>
    </View>
  );
}
