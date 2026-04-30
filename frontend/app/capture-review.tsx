import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PickedUploadFile } from '@/types';
import {
  getPendingCapturedFiles,
  setPendingCapturedFiles,
} from '@/features/upload';
import { Button } from '@/ui';

const COLORS = {
  bg: '#041228',
  surface: '#0B1E38',
  surfaceSoft: 'rgba(255,255,255,0.08)',
  white: '#FFFFFF',
  primary: '#1689F5',
  textMuted: '#B8CCE8',
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
          <Pressable style={styles.topAction} onPress={() => router.back()}>
            <MaterialIcons name="chevron-left" size={20} color={COLORS.white} />
          </Pressable>

          <View style={styles.topCopy}>
            <Text style={styles.eyebrow}>CAPTURE REVIEW</Text>
            <Text style={styles.title}>Captured pages</Text>
          </View>

          <View style={styles.topSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.body}>
            Review queued pages, remove anything blurry, then go back to keep scanning or finish upload.
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
            variant="secondary"
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
              <Text style={styles.removeButtonLabel}>X</Text>
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
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topAction: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCopy: {
    alignItems: 'center',
    gap: 4,
  },
  topSpacer: {
    width: 42,
    height: 42,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    fontFamily: 'Inter',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  body: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
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
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  cardMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },
  emptyState: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: COLORS.surface,
    gap: 8,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  emptyBody: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  previewModal: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  previewShell: {
    width: '88%',
    height: '78%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  previewClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewModalImage: {
    width: '100%',
    height: '100%',
  },
});
