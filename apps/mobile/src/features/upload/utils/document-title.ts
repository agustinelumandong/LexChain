const MAX_DOCUMENT_TITLE_LENGTH = 120;

export function sanitizeDocumentTitle(value: string): string {
  return value
    .replace(/\.[a-z0-9]{1,10}$/i, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, MAX_DOCUMENT_TITLE_LENGTH)
    .trimStart();
}

export function validateDocumentTitle(value: string): string | undefined {
  if (!sanitizeDocumentTitle(value).trim()) {
    return 'Enter a document title';
  }

  return undefined;
}
