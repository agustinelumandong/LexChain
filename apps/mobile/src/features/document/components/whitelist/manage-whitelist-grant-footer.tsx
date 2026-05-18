import {
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { Pressable, Text, View } from 'react-native';

import { manageWhitelistStyles as styles } from './manage-whitelist.styles';

type ManageWhitelistGrantFooterProps = {
  footerProps: BottomSheetFooterProps;
  bottomInset: number;
  revokeCountdown: number | null;
  revokeLabel: string;
  onPressRevoke: () => void;
};

export function ManageWhitelistGrantFooter({
  footerProps,
  bottomInset,
  revokeCountdown,
  revokeLabel,
  onPressRevoke,
}: ManageWhitelistGrantFooterProps) {
  return (
    <BottomSheetFooter
      {...footerProps}
      bottomInset={bottomInset}
      style={styles.grantFooterContainer}
    >
      <View style={styles.grantFooter}>
        <Pressable
          accessibilityRole="button"
          style={[
            styles.revokeButton,
            revokeCountdown !== null && revokeCountdown > 0 && styles.revokeButtonWaiting,
            revokeCountdown === 0 && styles.revokeButtonConfirm,
          ]}
          onPress={onPressRevoke}
        >
          <Text
            style={[
              styles.revokeButtonLabel,
              revokeCountdown !== null && revokeCountdown > 0 && styles.revokeButtonLabelWaiting,
              revokeCountdown === 0 && styles.revokeButtonLabelConfirm,
            ]}
          >
            {revokeLabel}
          </Text>
        </Pressable>
      </View>
    </BottomSheetFooter>
  );
}
