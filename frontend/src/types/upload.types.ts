export type PickedUploadFile = {
  id: string;
  name: string;
  sizeLabel?: string;
  uri: string;
  mimeType?: string;
  nativeFile?: File | Blob;
  sourceLabel: 'file' | 'camera';
};
