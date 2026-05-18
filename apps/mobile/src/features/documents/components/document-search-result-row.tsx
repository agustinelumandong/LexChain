import { Pressable, Text, View } from 'react-native';

import { styles } from '../documents-screen.styles';

type DocumentSearchResultRowProps = {
  title: string;
  summary: string;
  date: string;
  onPress: () => void;
};

export function DocumentSearchResultRow({
  title,
  summary,
  date,
  onPress,
}: DocumentSearchResultRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.resultRow,
        pressed && styles.resultRowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.resultCopy}>
        <Text style={styles.resultTitle}>{title}</Text>
        <Text style={styles.resultMeta} numberOfLines={2}>{summary}</Text>
      </View>
      <Text style={styles.resultDate}>{date}</Text>
    </Pressable>
  );
}
