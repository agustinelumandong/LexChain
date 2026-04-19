export type PickedUploadFile = {
  id: string;
  name: string;
  sizeLabel?: string;
  uri: string;
  mimeType?: string;
  sourceLabel: 'file' | 'camera';
};
