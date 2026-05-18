import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/ui';

import { termsBottomSheetStyles as styles } from './terms-bottom-sheet.styles';

type TermsFooterProps = {
  bottomInset: number;
  acceptedTerms: boolean;
  hasReachedEnd: boolean;
  isSubmitting: boolean;
  onToggleAcceptedTerms: () => void;
  onConfirm: () => void;
};

export function TermsFooter({
  bottomInset,
  acceptedTerms,
  hasReachedEnd,
  isSubmitting,
  onToggleAcceptedTerms,
  onConfirm,
}: TermsFooterProps) {
  return (
    <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 24) }]}>
      <Pressable
        style={[
          styles.checkboxRow,
          !hasReachedEnd && styles.checkboxRowDisabled,
        ]}
        onPress={hasReachedEnd ? onToggleAcceptedTerms : undefined}
      >
        <View
          style={[
            styles.checkbox,
            acceptedTerms && styles.checkboxChecked,
            !hasReachedEnd && styles.checkboxDisabled,
          ]}
        >
          {acceptedTerms ? <MaterialIcons name="check" size={16} color="#FFFFFF" /> : null}
        </View>

        <Text
          style={[
            styles.checkboxLabel,
            !hasReachedEnd && styles.checkboxLabelDisabled,
          ]}
        >
          I accept Terms of Service and Privacy Policy
        </Text>
      </Pressable>

      <Button
        label="Confirm and create account"
        fullWidth
        loading={isSubmitting}
        disabled={!hasReachedEnd || !acceptedTerms || isSubmitting}
        onPress={onConfirm}
      />
    </View>
  );
}
