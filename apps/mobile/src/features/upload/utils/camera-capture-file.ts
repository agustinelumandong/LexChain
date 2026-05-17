import type { PickedUploadFile } from '@/types';

import type { CapturedPhoto } from '../types/camera-capture.types';

export function formatFileSizeFromDimensions(photo: CapturedPhoto) {
  if (!photo.width || !photo.height) {
    return undefined;
  }

  const estimatedBytes = photo.width * photo.height * 0.45;

  if (estimatedBytes >= 1024 * 1024) {
    return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(estimatedBytes / 1024))} KB`;
}

export function buildCapturedFile(photo: CapturedPhoto, index: number): PickedUploadFile {
  return {
    id: `${photo.uri}-${index}-${Date.now()}`,
    name: `Captured page ${index + 1}`,
    sizeLabel: formatFileSizeFromDimensions(photo),
    uri: photo.uri,
    mimeType: 'image/jpeg',
    sourceLabel: 'camera',
  };
}
