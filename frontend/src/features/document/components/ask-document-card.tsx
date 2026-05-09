import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

const COLORS = {
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  surface: APP_COLORS.surface,
  surfaceSoft: APP_COLORS.surfaceSoft,
  primary: APP_COLORS.primary,
  success: APP_COLORS.success,
  warning: APP_COLORS.warning,
  bg: APP_COLORS.bg,
};

type AskCitation = {
  chunk_id: string;
  chunk_index: number;
  score: number;
};

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

  const handleSubmit = () => {
    const trimmed = question.trim();
    if (trimmed.length === 0 || isLoading) return;
    onAsk(trimmed);
  };

  const hasAnswer = answer !== undefined && answer.length > 0;
  const hasCitations = citations !== undefined && citations.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="question-answer" size={18} color={COLORS.primary} />
        <Text style={styles.title}>Ask this document</Text>
      </View>

      <View style={[styles.inputWrap, isInputFocused && styles.inputWrapFocused]}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask a question about this document..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          multiline
          numberOfLines={2}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          editable={!isLoading}
        />
      </View>

      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.askButton,
          (question.trim().length === 0 || isLoading) && styles.askButtonDisabled,
          pressed && styles.askButtonPressed,
        ]}
        disabled={question.trim().length === 0 || isLoading}
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

      {hasAnswer && (
        <View style={styles.answerSection}>
          <View style={styles.answerMeta}>
            <Text style={styles.answerLabel}>Answer</Text>
            {model && <Text style={styles.modelBadge}>{model}</Text>}
          </View>
          <View style={styles.answerBox}>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        </View>
      )}

      {hasCitations && (
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
      )}
    </View>
  );
}

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
    gap: 8,
  },
  title: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  inputWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputWrapFocused: {
    borderColor: COLORS.primary,
  },
  input: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    minHeight: 56,
    textAlignVertical: 'top',
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-end',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  askButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  askButtonDisabled: {
    opacity: 0.5,
  },
  askButtonText: {
    color: COLORS.surface,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  answerSection: {
    gap: 8,
    marginTop: 4,
  },
  answerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  answerLabel: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modelBadge: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  answerBox: {
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  answerText: {
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  citationsSection: {
    gap: 10,
  },
  citationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  citationsLabel: {
    color: COLORS.success,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  citationsList: {
    gap: 8,
  },
  citationRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  citationIndex: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: `${COLORS.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  citationIndexText: {
    color: COLORS.success,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },
  citationMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chunkIndex: {
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  citationScore: {
    color: COLORS.success,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
});