export const queryKeys = {
  auth: {
    currentUser: ['auth', 'current-user'] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    users: ['admin', 'users'] as const,
    invitations: ['admin', 'invitations'] as const,
  },
  documents: {
    all: ['documents'] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      ['documents', 'list', params ?? {}] as const,
    detail: (documentId: string) => ['documents', documentId] as const,
    versions: (documentId: string) => ['documents', documentId, 'versions'] as const,
    parties: (documentId: string) => ['documents', documentId, 'parties'] as const,
    search: (query: string) => ['documents', 'search', query] as const,
    documentSearch: (documentId: string, query: string) =>
      ['documents', documentId, 'search', query] as const,
  },
  blockchain: {
    verify: (documentId: string) => ['blockchain', 'verify', documentId] as const,
  },
  users: {
    search: (email: string) => ['users', 'search', email] as const,
  },
};
