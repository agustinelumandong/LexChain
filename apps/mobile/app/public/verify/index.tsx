import PublicVerifierDom from '@/features/verification/components/PublicVerifierDom';
import { publicApi } from '@/services/api';
import type { PickedUploadFile } from '@/types';

type PdfPayload = {
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
};

function formatFileSize(fileSize?: number) {
  if (!fileSize || Number.isNaN(fileSize)) {
    return undefined;
  }

  if (fileSize >= 1024 * 1024) {
    return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
}

export default function PublicVerifyIndexRoute() {
  return (
    <PublicVerifierDom
      verifyPdf={async (payload: PdfPayload) => {
        const response = await fetch(payload.dataUrl);
        const blob = await response.blob();
        const file: PickedUploadFile = {
          id: `${payload.name}-${Date.now()}`,
          name: payload.name,
          sizeLabel: formatFileSize(payload.size),
          uri: payload.dataUrl,
          mimeType: payload.mimeType,
          nativeFile: blob,
          sourceLabel: 'file',
        };

        return publicApi.verifyDocument(file);
      }}
      dom={{
        scrollEnabled: true,
        style: {
          flex: 1,
          width: '100%',
          minHeight: '100%',
        },
      }}
    />
  );
}
