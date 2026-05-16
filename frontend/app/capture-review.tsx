import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PickedUploadFile } from '@/types';
import {
  getPendingCapturedFiles,
  setPendingCapturedFiles,
} from '@/features/upload';
import { Button } from '@/ui';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  bg: APP_COLORS.surfaceSoft,
  surface: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  white: APP_COLORS.white,
  primary: APP_COLORS.primary,
  textMuted: APP_COLORS.textMuted,
  navy: APP_COLORS.navy,
};

export default function CaptureReviewScreen() {
  const router = useRouter();
  const [capturedFiles, setCapturedFiles] = useState<PickedUploadFile[]>([]);
  const [previewFile, setPreviewFile] = useState<PickedUploadFile | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setCapturedFiles(getPendingCapturedFiles());
    }, []),
  );

  const handleRemove = (fileId: string) => {
    const nextFiles = capturedFiles.filter((file) => file.id !== fileId);
    setCapturedFiles(nextFiles);
    setPendingCapturedFiles(nextFiles);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.surface}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to camera"
            style={styles.topBarButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={20} color={COLORS.navy} />
          </Pressable>
          <View style={styles.topBarCopy}>
            <Text style={styles.topBarEyebrow}>CAPTURE REVIEW</Text>
            <Text style={styles.topBarTitle}>Captured pages</Text>
          </View>
          <View style={styles.topBarButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.body}>
            Review queued pages, remove anything blurry, then go back to keep scanning or finish the PDF scan.
          </Text>

          {capturedFiles.length > 0 ? (
            <View style={styles.grid}>
              {capturedFiles.map((file, index) => (
                <View key={file.id} style={styles.gridCard}>
                  <Pressable onPress={() => setPreviewFile(file)}>
                    <Image
                      source={{ uri: file.uri }}
                      style={styles.gridPreview}
                      contentFit="cover"
                    />
                  </Pressable>

                  <View style={styles.gridFooter}>
                    <View style={styles.gridCopy}>
                      <Text style={styles.cardTitle}>Page {index + 1}</Text>
                      <Text style={styles.cardMeta} numberOfLines={1}>
                        {[file.sourceLabel.toUpperCase(), file.sizeLabel].filter(Boolean).join(' • ')}
                      </Text>
                    </View>

                    <Pressable style={styles.removeButton} onPress={() => handleRemove(file.id)}>
                      <Text style={styles.removeButtonLabel}>X</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No captured pages yet</Text>
              <Text style={styles.emptyBody}>Go back and capture a page first.</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Back to camera"
            variant="primary"
            fullWidth
            onPress={() => router.back()}
          />
        </View>
      </View>

      <Modal
        visible={previewFile !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewFile(null)}
      >
        <View style={styles.previewModal}>
          <Pressable style={styles.previewBackdrop} onPress={() => setPreviewFile(null)} />

          <View style={styles.previewShell}>
            <Pressable style={styles.previewClose} onPress={() => setPreviewFile(null)}>
              <MaterialIcons name="close" size={18} color={COLORS.white} />
            </Pressable>

            {previewFile ? (
              <Image
                source={{ uri: previewFile.uri }}
                style={styles.previewModalImage}
                contentFit="contain"
              />
            ) : null}
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.bg,
  },
  topBarButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSoft,
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
    color: COLORS.navy,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },  body: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  gridPreview: {
    width: '100%',
    aspectRatio: 0.82,
  },
  gridFooter: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  cardMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonLabel: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  emptyState: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: COLORS.surface,
    gap: 8,
  },
  emptyTitle: {
    color: COLORS.navy,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  emptyBody: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  previewModal: {
    flex: 1,
    backgroundColor: 'rgba(4, 18, 40, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  previewBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  previewShell: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  previewClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(4, 18, 40, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewModalImage: {
    width: '100%',
    height: '100%',
  },
});
