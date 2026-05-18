import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/ui';

import { CaptureReviewGrid } from '../components/capture-review/capture-review-grid';
import { CaptureReviewPreviewModal } from '../components/capture-review/capture-review-preview-modal';
import { CaptureReviewTopBar } from '../components/capture-review/capture-review-top-bar';
import { useCaptureReviewFlow } from '../hooks/use-capture-review-flow';
import { captureReviewStyles } from '../components/capture-review/capture-review.styles';

export default function CaptureReviewScreen() {
  const review = useCaptureReviewFlow();

  return (
    <SafeAreaView style={captureReviewStyles.screen}>
      <View style={captureReviewStyles.surface}>
        <CaptureReviewTopBar onBack={review.handleBack} />

        <ScrollView contentContainerStyle={captureReviewStyles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={captureReviewStyles.body}>
            Review queued pages, remove anything blurry, then go back to keep scanning or finish the PDF scan.
          </Text>

          <CaptureReviewGrid
            capturedFiles={review.capturedFiles}
            onPreviewFile={review.setPreviewFile}
            onRemoveFile={review.handleRemove}
          />
        </ScrollView>

        <View style={captureReviewStyles.footer}>
          <Button label="Back to camera" variant="primary" fullWidth onPress={review.handleBack} />
        </View>
      </View>

      <CaptureReviewPreviewModal file={review.previewFile} onClose={review.handleClosePreview} />
    </SafeAreaView>
  );
}
