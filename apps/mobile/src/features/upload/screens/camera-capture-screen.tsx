import { MaterialIcons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_COLORS, fonts } from '@/theme';
import { Button } from '@/ui';

import { useCameraCaptureFlow } from '../hooks/use-camera-capture-flow';

const COLORS = {
  bg: '#041228',
  overlay: 'rgba(4, 18, 40, 0.68)',
  white: APP_COLORS.white,
  primary: APP_COLORS.primary,
  primarySoft: 'rgba(22, 137, 245, 0.16)',
  textMuted: '#B8CCE8',
  frame: 'rgba(255,255,255,0.18)',
};

export default function CameraCaptureScreen() {
  const camera = useCameraCaptureFlow();

  if (!camera.permission) {
    return <SafeAreaView style={styles.screen} />;
  }

  if (!camera.permission.granted) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.permissionWrap}>
          <Text style={styles.permissionEyebrow}>CAMERA ACCESS</Text>
          <Text style={styles.permissionTitle}>Allow camera access</Text>
          <Text style={styles.permissionBody}>
            LexChain needs camera access so you can capture a document directly in the app.
          </Text>

          <View style={styles.permissionActions}>
            <Button label="Grant permission" fullWidth onPress={camera.requestPermission} />
            <Button
              label="Back to upload"
              variant="secondary"
              fullWidth
              onPress={camera.handleBack}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.surface}>
        {camera.capturedPhoto ? (
          <Image
            source={{ uri: camera.capturedPhoto.uri }}
            style={styles.cameraPreview}
            contentFit="cover"
          />
        ) : (
          <CameraView ref={camera.cameraRef} style={styles.cameraPreview} facing={camera.facing} />
        )}

        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to upload"
            style={styles.topBarButton}
            onPress={camera.handleBack}
          >
            <MaterialIcons name="close" size={20} color={COLORS.white} />
          </Pressable>

          <View style={styles.topBarCopy}>
            <Text style={styles.topBarEyebrow}>CAMERA</Text>
            <Text style={styles.topBarTitle}>Scan to PDF</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Flip camera"
            style={styles.topBarButton}
            onPress={() => camera.setFacing((current) => (current === 'back' ? 'front' : 'back'))}
          >
            <MaterialIcons name="flip-camera-ios" size={20} color={COLORS.white} />
          </Pressable>
        </View>

        {!camera.capturedPhoto ? (
          <View style={[styles.frameWrap, styles.nonInteractive]}>
            <View style={styles.captureFrame} />
            <Text style={styles.frameHint}>Align document inside frame</Text>
          </View>
        ) : null}

        <View style={styles.bottomPanel}>
          {camera.capturedPhoto ? (
            <View style={styles.panelActions}>
              <Button
                label="Retake"
                variant="secondary"
                fullWidth
                onPress={() => camera.setCapturedPhoto(null)}
              />
              <Button
                label="Add page"
                variant="secondary"
                fullWidth
                onPress={camera.handleAddPage}
              />
              <Button
                label={camera.capturedQueue.length > 0 ? 'Finish scan' : 'Use photo'}
                fullWidth
                onPress={camera.handleFinishCapture}
              />
            </View>
          ) : (
            <View style={styles.captureControls}>
              <Pressable style={styles.galleryStub} onPress={camera.handleOpenReview}>
                <MaterialIcons name="collections" size={20} color={COLORS.white} />
                {camera.capturedQueue.length > 0 ? (
                  <View style={styles.queueBubble}>
                    <Text style={styles.queueBubbleText}>
                      {camera.capturedQueue.length > 99 ? '99+' : camera.capturedQueue.length}
                    </Text>
                  </View>
                ) : null}
              </Pressable>

              <Pressable style={styles.captureButton} onPress={camera.handleTakePhoto}>
                <View style={styles.captureButtonInner} />
              </Pressable>

              {camera.capturedQueue.length > 0 ? (
                <Pressable style={styles.flashStub} onPress={camera.handleFinishCapture}>
                  <MaterialIcons name="check" size={20} color={COLORS.white} />
                </Pressable>
              ) : (
                <Pressable style={styles.flashStub}>
                  <MaterialIcons name="flash-off" size={20} color={COLORS.white} />
                </Pressable>
              )}
            </View>
          )}
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
  permissionWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  permissionEyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  permissionTitle: {
    color: COLORS.white,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  permissionBody: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  permissionActions: {
    gap: 12,
    marginTop: 8,
  },
  cameraPreview: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  topBarButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCopy: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  topBarEyebrow: {
    color: COLORS.primary,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topBarTitle: {
    color: COLORS.white,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  frameWrap: {
    position: 'absolute',
    top: '16%',
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 12,
  },
  nonInteractive: {
    pointerEvents: 'none',
  },
  captureFrame: {
    width: '100%',
    aspectRatio: 0.62,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.frame,
    backgroundColor: 'transparent',
  },
  frameHint: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  bottomPanel: {
    position: 'absolute',
    left: 42,
    right: 42,
    bottom: 42,
    gap: 14,
  },
  panelActions: {
    gap: 10,
  },
  captureControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  galleryStub: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueBubble: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    paddingHorizontal: 4,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueBubbleText: {
    color: COLORS.white,
    fontSize: 10,
    lineHeight: 10,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  flashStub: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 999,
    backgroundColor: COLORS.white,
  },
});
