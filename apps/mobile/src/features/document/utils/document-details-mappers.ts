import type {
  DocumentDetailsVersion,
  VersionHistoryItem,
} from '../types/document-details.types';
import { formatDate, formatStatusLabel } from './document-details-formatters';

export function buildVersionHistory({
  createdAt,
  status,
}: {
  createdAt: string;
  status: string;
}): VersionHistoryItem[] {
  return [
    {
      id: 'original',
      date: formatDate(createdAt),
      label: 'Original upload',
      description: 'First version captured in LexChain for processing and review.',
    },
    {
      id: 'current',
      date: formatDate(createdAt),
      label: 'Current version',
      status,
      statusLabel: formatStatusLabel(status),
      description: 'Active document version used for search, summaries, and access review.',
      isCurrent: true,
    },
  ];
}

export function mapApiVersionHistory(
  versions: DocumentDetailsVersion[] = [],
): VersionHistoryItem[] {
  return versions.map((version) => ({
    id: version.document_id,
    documentId: version.document_id,
    date: formatDate(version.created_at),
    fileName: version.file_name,
    label: version.is_latest ? 'Current version' : version.file_name,
    status: version.status,
    statusLabel: formatStatusLabel(version.status),
    description: version.is_latest
      ? 'Active document version used for search, summaries, and access review.'
      : 'Previous document version kept in the version history.',
    isCurrent: version.is_latest,
    uri: version.storage_url,
  }));
}
