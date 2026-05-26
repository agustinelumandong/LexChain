import { View } from 'react-native';

import { Button } from '@/ui';

import { processingScreenStyles as styles } from './processing-screen.styles';

type ProcessingFooterProps = {
  onPressBackToDocuments: () => void;
};

export function ProcessingFooter({ onPressBackToDocuments }: ProcessingFooterProps) {
  return (
    <View style={styles.footer}>
      <Button
        label="Back to documents"
        fullWidth
        leftIconName="arrow-back"
        onPress={onPressBackToDocuments}
      />
    </View>
  );
}
