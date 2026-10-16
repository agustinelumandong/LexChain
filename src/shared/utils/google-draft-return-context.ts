export type GoogleDraftReturnContext = {
  documentId: string;
  source: 'blank' | 'template' | 'existing';
  picked: { id: string; name: string } | null;
};

const storageKey = 'lexchain:google-draft-return';

function isDocumentId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

function isContext(value: unknown): value is GoogleDraftReturnContext {
  if (typeof value !== 'object' || value === null) return false;
  const context = value as Partial<GoogleDraftReturnContext>;
  return isDocumentId(context.documentId)
    && (context.source === 'blank' || context.source === 'template' || context.source === 'existing')
    && (context.picked === null || (
      typeof context.picked === 'object'
      && typeof context.picked.id === 'string'
      && Boolean(context.picked.id.trim())
      && typeof context.picked.name === 'string'
      && Boolean(context.picked.name.trim())
    ))
    && (context.source !== 'blank' || context.picked === null);
}

function getSessionStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveGoogleDraftReturnContext(context: GoogleDraftReturnContext): void {
  const storage = getSessionStorage();
  if (!storage) throw new Error('Session storage is unavailable. Your draft choices could not be saved.');
  if (!isContext(context)) throw new Error('Google draft return context is invalid.');
  storage.setItem(storageKey, JSON.stringify(context));
}

export function readGoogleDraftReturnContext(): GoogleDraftReturnContext | null {
  const storage = getSessionStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (isContext(value)) return value;
    storage.removeItem(storageKey);
  } catch {
    storage.removeItem(storageKey);
  }
  return null;
}

export function clearGoogleDraftReturnContext(): void {
  getSessionStorage()?.removeItem(storageKey);
}

export function googleDraftReturnPath(documentId: string): string | null {
  return isDocumentId(documentId) ? `/portal/documents/${encodeURIComponent(documentId)}` : null;
}
