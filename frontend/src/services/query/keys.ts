export const queryKeys = {
  auth: {
    currentUser: ['auth', 'current-user'] as const,
  },
  documents: {
    all: ['documents'] as const,
    detail: (documentId: string) => ['documents', documentId] as const,
    search: (query: string) => ['documents', 'search', query] as const,
  },
};
