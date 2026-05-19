import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import botAvatarImage from '@/assets/images/lexchain-bot.png';
import type { AskDocumentChatMessage } from '@/features/document/types/ask-document.types';
import { askDocumentStyles as styles } from './ask-document.styles';

type AskDocumentMessagesProps = {
  messages: AskDocumentChatMessage[];
  isLoading?: boolean;
};

export function AskDocumentMessages({ messages, isLoading }: AskDocumentMessagesProps) {
  return (
    <>
      {messages.map((message) =>
        message.role === 'assistant' ? (
          <View key={message.id} style={styles.assistantMessageRow}>
            <Image source={botAvatarImage} style={styles.botAvatar} contentFit="contain" />
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <Text style={[styles.messageText, styles.assistantText]}>
                {message.text}
              </Text>
            </View>
          </View>
        ) : (
          <View key={message.id} style={[styles.messageBubble, styles.userBubble]}>
            <Text style={[styles.messageText, styles.userText]}>
              {message.text}
            </Text>
          </View>
        ),
      )}

      {isLoading ? (
        <View style={styles.assistantMessageRow}>
          <Image source={botAvatarImage} style={styles.botAvatar} contentFit="contain" />
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <Text style={[styles.messageText, styles.assistantText]}>Thinking...</Text>
          </View>
        </View>
      ) : null}
    </>
  );
}
