import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { PickedUploadFile } from '@/types';
import { Button } from '@/ui';

import { APP_COLORS, fonts } from '@/theme';
const COLORS = {
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  surface: APP_COLORS.white,
  surfaceSecondary: '#F7FBFF',
  surfaceSoft: APP_COLORS.surfaceSoft,
};

type UploadDropzoneCardProps = {
  mode?: 'empty' | 'selected';
  files?: PickedUploadFile[];
  onChooseFile?: () => void;
  onPreviewFile?: (file: PickedUploadFile) => void;
  onShareFile?: (file: PickedUploadFile) => void;
  onRemoveFile?: (fileId: string) => void;
};

function MetaChip({ label }: { label: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipLabel}>{label}</Text>
    </View>
  );
}

export function UploadDropzoneCard({
  mode = 'empty',
  files = [],
  onChooseFile,
  onPreviewFile,
  onShareFile,
  onRemoveFile,
}: UploadDropzoneCardProps) {
  const isSelected = mode === 'selected';
  const cameraCount = files.filter((file) => file.sourceLabel === 'camera').length;
  const fileCount = files.filter((file) => file.sourceLabel === 'file').length;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, isSelected && styles.iconWrapScanned]}>
          <MaterialIcons
            name={isSelected ? 'description' : 'cloud-upload'}
            size={24}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.title}>
          {isSelected ? 'Upload queue ready' : 'Upload legal document'}
        </Text>

        <Text style={styles.body}>
          {isSelected
            ? 'Review the PDF that will be uploaded, remove it if needed, then continue to processing.'
            : 'Choose an existing PDF or scan pages with the camera. LexChain stores the final document as PDF.'}
        </Text>

        {isSelected ? (
          <View style={styles.selectedList}>
            {files.map((file, index) => (
              <View key={file.id} style={styles.selectedFileCard}>
                <View style={styles.selectedFileCopy}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {file.name || `Selected document ${index + 1}`}
                  </Text>
                  <Text style={styles.selectedFileMeta}>
                    {[file.sourceLabel.toUpperCase(), file.sizeLabel].filter(Boolean).join(' • ')}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => onPreviewFile?.(file)}
                  style={styles.fileActionButton}
                >
                  <MaterialIcons name="visibility" size={16} color={COLORS.primary} />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => onShareFile?.(file)}
                  style={styles.fileActionButton}
                >
                  <MaterialIcons name="file-download" size={16} color={COLORS.primary} />
                </Pressable>

                <Pressable style={styles.removeButton} onPress={() => onRemoveFile?.(file.id)}>
                  <Text style={styles.removeButtonLabel}>X</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        {isSelected ? (
          <>
            <MetaChip label={`${files.length} ITEM${files.length > 1 ? 'S' : ''}`} />
            {fileCount > 0 ? <MetaChip label="PDF FILE" /> : null}
            {cameraCount > 0 ? <MetaChip label="SCAN PDF" /> : null}
          </>
        ) : (
          <>
            <MetaChip label="PDF ONLY" />
            <MetaChip label="UP TO 10 MB" />
          </>
        )}
      </View>

      <Button
        label={isSelected ? 'Replace PDF' : 'Choose PDF'}
        fullWidth
        leftIconName="upload"
        onPress={onChooseFile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 18,
    gap: 14,
    shadowColor: APP_COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  top: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapScanned: {
    width: 44,
    height: 44,
  },
  title: {
    color: COLORS.navy,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  body: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  selectedList: {
    width: '100%',
    gap: 8,
  },
  selectedFileCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedFileCopy: {
    flex: 1,
    gap: 4,
  },
  selectedFileName: {
    color: COLORS.navy,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: fonts.regular,
  },
  selectedFileMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
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
  fileActionButton: {
    width: 32,
    height: 32,
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
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaChip: {
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaChipLabel: {
    color: COLORS.primary,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    fontFamily: fonts.regular,
    letterSpacing: 0.4,
  },
});
