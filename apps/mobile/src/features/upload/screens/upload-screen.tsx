import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { Button, ScreenHeader } from '@/ui';
import { APP_COLORS } from '@/theme';

import { UploadDropzoneCard } from '../upload-dropzone-card';
import { useUploadFlow } from '../hooks/use-upload-flow';

const COLORS = {
  bg: APP_COLORS.bg,
  primary: APP_COLORS.primary,
  white: APP_COLORS.white,
  textMuted: APP_COLORS.textMuted,
  navy: APP_COLORS.navy,
  borderSoft: APP_COLORS.borderSoft,
};

const HEADER_CONTENT_GAP = 12;

export default function UploadScreen() {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(126);
  const upload = useUploadFlow();

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.surface}>
        <ScreenHeader
          eyebrow="UPLOAD DOCUMENT"
          title="Upload document"
          subtitle="Choose a PDF or scan pages into one PDF."
          leftAccessibilityLabel="Back"
          rightIconName="photo-camera"
          rightAccessibilityLabel="Open camera scanner"
          onPressLeft={() => router.back()}
          onPressRight={upload.handleOpenCameraCapture}
          onHeightChange={setHeaderHeight}
          includeTopInset
        />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + HEADER_CONTENT_GAP },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleInputContainer}>
            <Text style={styles.titleInputLabel}>Document Title</Text>
            <TextInput
              style={styles.titleInput}
              value={upload.documentTitle}
              onChangeText={upload.setDocumentTitle}
              placeholder="Enter document title"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <UploadDropzoneCard
            mode={upload.pickedFiles.length > 0 ? 'selected' : 'empty'}
            files={upload.pickedFiles}
            onChooseFile={upload.handleChooseFile}
            onPreviewFile={upload.handlePreviewFile}
            onShareFile={upload.handleShareFile}
            onRemoveFile={upload.handleRemoveFile}
          />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerActions}>
            <View style={styles.uploadButtonWrap}>
              <Button
                label="Upload document"
                fullWidth
                rightIconName="arrow-forward"
                disabled={
                  upload.pickedFiles.length === 0 ||
                  upload.isPreparingScanPdf ||
                  upload.isUploadingDocument
                }
                loading={upload.isPreparingScanPdf || upload.isUploadingDocument}
                onPress={upload.handleContinueToProcessing}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={upload.handleOpenCameraCapture}
              style={styles.cameraFab}
            >
              <MaterialIcons name="photo-camera" size={24} color={COLORS.white} />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  surface: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    alignItems: 'center',
  },
  footerActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  uploadButtonWrap: {
    flex: 1,
    maxWidth: 252,
  },
  cameraFab: {
    width: 62,
    height: 62,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APP_COLORS.primary,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  titleInputContainer: {
    gap: 8,
  },
  titleInputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
  titleInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.navy,
  },
});
