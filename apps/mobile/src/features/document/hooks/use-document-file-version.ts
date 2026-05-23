import { useMemo } from 'react';

import type {
  DocumentDetailsDocument,
  DocumentDetailsVersion,
} from '../types/document-details.types';
import { getDocumentPdfUri } from '../utils/document-details-formatters';
import {
  buildVersionHistory,
  mapApiVersionHistory,
} from '../utils/document-details-mappers';

export function useDocumentFileVersion({
  document,
  versions,
}: {
  document?: DocumentDetailsDocument;
  versions?: DocumentDetailsVersion[];
}) {
  const versionHistory = useMemo(() => {
    if (!document) {
      return [];
    }

    const apiVersions = mapApiVersionHistory(versions);

    if (apiVersions.length > 0) {
      return apiVersions;
    }

    return buildVersionHistory({
      createdAt: document.created_at,
      status: document.status,
    }).map((version) => ({
      ...version,
      documentId: document.document_id,
      fileName: document.file_name,
      uri: getDocumentPdfUri(document),
    }));
  }, [document, versions]);

  const pdfUri = useMemo(() => {
    if (!document) {
      return undefined;
    }

    return getDocumentPdfUri(document);
  }, [document]);

  return {
    pdfUri,
    versionHistory,
  };
}
