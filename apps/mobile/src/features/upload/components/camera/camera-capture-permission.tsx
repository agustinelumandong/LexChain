import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/ui';

import { cameraCaptureStyles as styles } from './camera-capture.styles';

type CameraCapturePermissionProps = {
  onGrantPermission: () => void;
  onBack: () => void;
};

export function CameraCapturePermission({
  onGrantPermission,
  onBack,
}: CameraCapturePermissionProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.permissionWrap}>
        <Text style={styles.permissionEyebrow}>CAMERA ACCESS</Text>
        <Text style={styles.permissionTitle}>Allow camera access</Text>
        <Text style={styles.permissionBody}>
          LexChain needs camera access so you can capture a document directly in the app.
        </Text>

        <View style={styles.permissionActions}>
          <Button label="Grant permission" fullWidth onPress={onGrantPermission} />
          <Button
            label="Back to upload"
            variant="secondary"
            fullWidth
            onPress={onBack}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
