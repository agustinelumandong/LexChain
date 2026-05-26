import { View } from 'react-native';

import { Button } from '@/ui';

import { termsBottomSheetStyles as styles } from './terms-bottom-sheet.styles';

type TermsFooterProps = {
  bottomInset: number;
  acceptedTerms: boolean;
  hasReachedEnd: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
};

export function TermsFooter({
  bottomInset,
  acceptedTerms,
  hasReachedEnd,
  isSubmitting,
  onConfirm,
}: TermsFooterProps) {
  return (
    <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 24) }]}>
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
