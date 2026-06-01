import type { PickedUploadFile } from '@/types';

type NativeDocumentScannerModule = {
  scanDocument: (options?: {
    croppedImageQuality?: number;
    maxNumDocuments?: number;
    responseType?: 'base64' | 'imageFilePath';
  }) => Promise<{
    scannedImages?: string[];
    status?: 'success' | 'cancel';
  }>;
};

export class NativeDocumentScanCancelledError extends Error {
  constructor() {
    super('Document scan cancelled');
    this.name = 'NativeDocumentScanCancelledError';
  }
}

function normalizeScannedImageUri(uri: string) {
  if (/^(file|content):\/\//.test(uri)) {
    return uri;
  }

  return uri.startsWith('/') ? `file://${uri}` : uri;
}

async function getNativeDocumentScanner() {
  const scanner = await import('react-native-document-scanner-plugin') as unknown as {
    default?: NativeDocumentScannerModule;
  } & NativeDocumentScannerModule;

  return scanner.default ?? scanner;
}

export async function scanDocumentsWithNativeScanner(): Promise<PickedUploadFile[]> {
  const documentScanner = await getNativeDocumentScanner();
  const response = await documentScanner.scanDocument({
    croppedImageQuality: 92,
    responseType: 'imageFilePath',
  });

  if (response.status === 'cancel') {
    throw new NativeDocumentScanCancelledError();
  }

  const scannedImages = (response.scannedImages ?? [])
    .map((uri) => uri.trim())
    .filter(Boolean);

  if (scannedImages.length === 0) {
    throw new NativeDocumentScanCancelledError();
  }

  const timestamp = Date.now();

  return scannedImages.map((uri, index) => {
    const normalizedUri = normalizeScannedImageUri(uri);

    return {
      id: `${normalizedUri}-${timestamp}-${index}`,
      name: `Scanned page ${index + 1}.jpg`,
      uri: normalizedUri,
      mimeType: 'image/jpeg',
      sourceLabel: 'camera',
    };
  });
}
