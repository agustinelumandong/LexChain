import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Print from 'expo-print';

import type { PickedUploadFile } from '@/types';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function imageToDataUri(file: PickedUploadFile) {
  const result = await ImageManipulator.manipulateAsync(
    file.uri,
    [{ resize: { width: 1240 } }],
    {
      base64: true,
      compress: 0.72,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
  const base64 = result.base64 ?? await new File(result.uri).base64();
  const mimeType = 'image/jpeg';

  return `data:${mimeType};base64,${base64}`;
}

function buildScanHtml(imageDataUris: string[]) {
  const pages = imageDataUris
    .map(
      (uri, index) => `
        <section class="page">
          <img src="${escapeHtml(uri)}" alt="Scanned page ${index + 1}" />
        </section>
      `,
    )
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page {
            size: letter;
            margin: 0;
            padding: 64px;
          }

          body {
            margin: 0;
            background: #ffffff;
          }

          .page {
            width: auto;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            page-break-after: always;
            background: #ffffff;
          }

          .page:last-child {
            page-break-after: auto;
          }

          img {
            display: block;
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 100%;
            margin: auto;
          }
        </style>
      </head>
      <body>${pages}</body>
    </html>
  `;
}

export async function createPdfFromImages(
  imageFiles: PickedUploadFile[],
): Promise<PickedUploadFile> {
  if (imageFiles.length === 0) {
    throw new Error('At least one captured page is required');
  }

  const imageDataUris = await Promise.all(imageFiles.map(imageToDataUri));
  const pdf = await Print.printToFileAsync({
    html: buildScanHtml(imageDataUris),
    width: 612,
    height: 792,
  });
  const timestamp = Date.now();

  return {
    id: `${pdf.uri}-${timestamp}`,
    name: `scanned-document-${timestamp}.pdf`,
    uri: pdf.uri,
    mimeType: 'application/pdf',
    sourceLabel: 'camera',
  };
}
