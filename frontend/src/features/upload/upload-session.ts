import type { PickedUploadFile } from './upload-file';

let pendingCapturedFiles: PickedUploadFile[] = [];

export function setPendingCapturedFiles(files: PickedUploadFile[]) {
  pendingCapturedFiles = files;
}

export function getPendingCapturedFiles() {
  return pendingCapturedFiles;
}

export function consumePendingCapturedFiles() {
  const nextFiles = pendingCapturedFiles;
  pendingCapturedFiles = [];
  return nextFiles;
}
