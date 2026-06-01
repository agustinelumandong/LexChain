import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { AskCitation } from '@/features/document/types/ask-document-card.types';
import { AskDocumentAnswer } from './ask-document-answer';
import { AskDocumentCitations } from './ask-document-citations';
import { AskDocumentQuestionInput } from './ask-document-question-input';
import {
  ASK_DOCUMENT_CARD_COLORS as COLORS,
  askDocumentCardStyles as styles,
} from './ask-document-card.styles';

type AskDocumentCardProps = {
  answer?: string;
  model?: string;
  citations?: AskCitation[];
  isLoading?: boolean;
  onAsk: (question: string) => void;
};

export function AskDocumentCard({
  answer,
  model,
  citations,
  isLoading = false,
  onAsk,
}: AskDocumentCardProps) {
  const [question, setQuestion] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const isAskDisabled = question.trim().length === 0 || isLoading;
  const hasAnswer = answer !== undefined && answer.length > 0;
  const hasCitations = citations !== undefined && citations.length > 0;

  const handleSubmit = () => {
    const trimmed = question.trim();
    if (trimmed.length === 0 || isLoading) {
      return;
    }
    onAsk(trimmed);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="question-answer" size={18} color={COLORS.primary} />
        <Text style={styles.title}>Ask this document</Text>
      </View>

      <AskDocumentQuestionInput
        value={question}
        isFocused={isInputFocused}
        isLoading={isLoading}
        onChangeText={setQuestion}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
      />

      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.askButton,
          isAskDisabled && styles.askButtonDisabled,
          pressed && styles.askButtonPressed,
        ]}
        disabled={isAskDisabled}
      >
        {isLoading ? (
          <MaterialIcons name="hourglass-empty" size={18} color={COLORS.surface} />
        ) : (
          <MaterialIcons name="send" size={18} color={COLORS.surface} />
        )}
        <Text style={styles.askButtonText}>
          {isLoading ? 'Thinking...' : 'Ask'}
        </Text>
      </Pressable>

      {hasAnswer ? <AskDocumentAnswer answer={answer} model={model} /> : null}
      {hasCitations ? <AskDocumentCitations citations={citations} /> : null}
    </View>
  );
}
