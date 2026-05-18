import React from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { PickedUploadFile } from '@/types';
import { Button } from '@/ui';

import { UploadDropzoneMetaChip } from './upload-dropzone-meta-chip';
import { UploadDropzoneSelectedList } from './upload-dropzone-selected-list';
import { uploadDropzoneColors, uploadDropzoneStyles } from './upload-dropzone-card.styles';

type UploadDropzoneCardProps = {
  mode?: 'empty' | 'selected';
  files?: PickedUploadFile[];
  onChooseFile?: () => void;
  onPreviewFile?: (file: PickedUploadFile) => void;
  onShareFile?: (file: PickedUploadFile) => void;
  onRemoveFile?: (fileId: string) => void;
};

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
    <View style={uploadDropzoneStyles.card}>
      <View style={uploadDropzoneStyles.top}>
        <View style={[uploadDropzoneStyles.iconWrap, isSelected && uploadDropzoneStyles.iconWrapScanned]}>
          <MaterialIcons
            name={isSelected ? 'description' : 'cloud-upload'}
            size={24}
            color={uploadDropzoneColors.primary}
          />
        </View>

        <Text style={uploadDropzoneStyles.title}>
          {isSelected ? 'Upload queue ready' : 'Upload legal document'}
        </Text>

        <Text style={uploadDropzoneStyles.body}>
          {isSelected
            ? 'Review the PDF that will be uploaded, remove it if needed, then continue to processing.'
            : 'Choose an existing PDF or scan pages with the camera. LexChain stores the final document as PDF.'}
        </Text>

        {isSelected ? (
          <UploadDropzoneSelectedList
            files={files}
            onPreviewFile={onPreviewFile}
            onShareFile={onShareFile}
            onRemoveFile={onRemoveFile}
          />
        ) : null}
      </View>

      <View style={uploadDropzoneStyles.metaRow}>
        {isSelected ? (
          <>
            <UploadDropzoneMetaChip label={`${files.length} ITEM${files.length > 1 ? 'S' : ''}`} />
            {fileCount > 0 ? <UploadDropzoneMetaChip label="PDF FILE" /> : null}
            {cameraCount > 0 ? <UploadDropzoneMetaChip label="SCAN PDF" /> : null}
          </>
        ) : (
          <>
            <UploadDropzoneMetaChip label="PDF ONLY" />
            <UploadDropzoneMetaChip label="UP TO 10 MB" />
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
