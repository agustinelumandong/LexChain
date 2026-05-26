import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { ScreenHeader } from '@/ui';

import { UploadDropzoneCard } from '../components/dropzone/upload-dropzone-card';
import { UploadFooter } from '../components/form/upload-footer';
import { UploadTitleField } from '../components/form/upload-title-field';
import { useUploadFlow } from '../hooks/use-upload-flow';
import { uploadScreenStyles } from './upload-screen.styles';

const HEADER_CONTENT_GAP = 12;

export default function UploadScreen() {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(126);
  const upload = useUploadFlow();

  return (
    <SafeAreaView style={uploadScreenStyles.screen} edges={['left', 'right', 'bottom']}>
      <View style={uploadScreenStyles.surface}>
        <ScreenHeader
          eyebrow="UPLOAD DOCUMENT"
          title="Upload document"
          subtitle="Choose a PDF or scan documents into one PDF."
          leftAccessibilityLabel="Back"
          rightIconName="photo-camera"
          rightAccessibilityLabel="Scan document"
          onPressLeft={() => router.back()}
          onPressRight={upload.handleOpenCameraCapture}
          onHeightChange={setHeaderHeight}
          includeTopInset
        />
        <ScrollView
          contentContainerStyle={[
            uploadScreenStyles.scrollContent,
            { paddingTop: headerHeight + HEADER_CONTENT_GAP },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <UploadTitleField
            value={upload.documentTitle}
            onChangeText={upload.setDocumentTitle}
          />

          <UploadDropzoneCard
            mode={upload.pickedFiles.length > 0 ? 'selected' : 'empty'}
            files={upload.pickedFiles}
            onChooseFile={upload.handleChooseFile}
            onPreviewFile={upload.handlePreviewFile}
            onRemoveFile={upload.handleRemoveFile}
          />
        </ScrollView>

        <UploadFooter
          disabled={
            upload.pickedFiles.length === 0 ||
            upload.isPreparingScanPdf ||
            upload.isUploadingDocument
          }
          loading={upload.isPreparingScanPdf || upload.isUploadingDocument}
          onOpenCamera={upload.handleOpenCameraCapture}
          onUpload={upload.handleContinueToProcessing}
        />
      </View>
    </SafeAreaView>
  );
}
