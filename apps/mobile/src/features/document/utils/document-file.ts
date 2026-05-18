import type { PickedUploadFile } from '@/types';

export function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function formatFileSize(fileSize?: number | null) {
  if (!fileSize || Number.isNaN(fileSize)) {
    return undefined;
  }

  if (fileSize >= 1024 * 1024) {
    return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
}

export function isPdfFile(file: PickedUploadFile) {
  const mimeType = file.mimeType?.toLowerCase();
  return mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
