import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, View } from 'react-native';

import { Button } from '@/ui';

import { uploadScreenColors, uploadScreenStyles } from '../../screens/upload-screen.styles';

type UploadFooterProps = {
  disabled: boolean;
  loading: boolean;
  onOpenCamera: () => void;
  onUpload: () => void;
};

export function UploadFooter({
  disabled,
  loading,
  onOpenCamera,
  onUpload,
}: UploadFooterProps) {
  return (
    <View style={uploadScreenStyles.footer}>
      <View style={uploadScreenStyles.footerActions}>
        <View style={uploadScreenStyles.uploadButtonWrap}>
          <Button
            label="Upload document"
            fullWidth
            rightIconName="arrow-forward"
            disabled={disabled}
            loading={loading}
            onPress={onUpload}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onOpenCamera}
          style={uploadScreenStyles.cameraFab}
        >
          <MaterialIcons name="photo-camera" size={24} color={uploadScreenColors.white} />
        </Pressable>
      </View>
    </View>
  );
}
