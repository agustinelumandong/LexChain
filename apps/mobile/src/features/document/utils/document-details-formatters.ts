import { ENTITY_TYPE_LABELS, TEST_PDF_URI } from '../constants/document-details.constants';
import type { DetailBodyBlock, DocumentDetailsDocument } from '../types/document-details.types';

export function formatDate(value?: string) {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatContentType(value: string) {
  if (value === 'application/pdf') {
    return 'PDF';
  }

  return value.split('/').pop()?.toUpperCase() ?? value;
}

export function formatReference(value: string) {
  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-7)}`;
}

export function getDocumentPdfUri(document: Pick<
  DocumentDetailsDocument,
  'storage_url' | 'file_uri' | 'file_url' | 'pdf_url'
>) {
  return (
    document.pdf_url ??
    document.file_url ??
    document.file_uri ??
    document.storage_url ??
    TEST_PDF_URI
  );
}

export function formatStatusLabel(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function getRecordText(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function formatEntities(entities?: Record<string, unknown>[]): DetailBodyBlock[] {
  if (!entities?.length) {
    return [
      {
        kind: 'group',
        title: 'Extracted details',
        values: ['No extracted information yet'],
      },
    ];
  }

  const grouped = entities.reduce<Record<string, string[]>>((groups, entity) => {
    const rawType = getRecordText(entity, 'type');
    const label = ENTITY_TYPE_LABELS[rawType] ?? 'Other details';
    const value = getRecordText(entity, 'value');

    if (!value) {
      return groups;
    }

    return {
      ...groups,
      [label]: [...(groups[label] ?? []), value],
    };
  }, {});

  const blocks = Object.entries(grouped).map(([label, values]) => {
    const uniqueValues = [...new Set(values)];
    return {
      kind: 'group' as const,
      title: label,
      values: uniqueValues,
    };
  });

  return blocks.length
    ? blocks
    : [
        {
          kind: 'group',
          title: 'Extracted details',
          values: ['No extracted information yet'],
        },
      ];
}

export function formatRiskFlags(riskFlags?: Record<string, unknown>[]): DetailBodyBlock[] {
  if (!riskFlags?.length) {
    return [
      {
        kind: 'risk',
        text: 'No risk flags found',
      },
    ];
  }

  return riskFlags.map((riskFlag) => {
    const clause = getRecordText(riskFlag, 'clause') || 'Potential issue detected';
    const severity = getRecordText(riskFlag, 'severity');

    return {
      kind: 'risk' as const,
      severity: severity ? `${severity.toUpperCase()} RISK` : undefined,
      text: clause,
    };
  });
}

export function formatWhitelistCountLabel(count: number) {
  return `${count} allowed user${count === 1 ? '' : 's'}`;
}
