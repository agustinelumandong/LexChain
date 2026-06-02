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
    list: (params?: { bookId?: string; limit?: number; offset?: number }) =>
      ['documents', 'list', params ?? {}] as const,
    detail: (documentId: string) => ['documents', documentId] as const,
    invitations: ['documents', 'invitations'] as const,
    versions: (documentId: string) => ['documents', documentId, 'versions'] as const,
    auditLogs: (documentId: string) => ['documents', documentId, 'audit-logs'] as const,
    parties: (documentId: string) => ['documents', documentId, 'parties'] as const,
    search: (query: string) => ['documents', 'search', query] as const,
    documentSearch: (documentId: string, query: string) =>
      ['documents', documentId, 'search', query] as const,
  },
  books: {
    all: ['books'] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      ['books', 'list', params ?? {}] as const,
    detail: (bookId: string) => ['books', bookId] as const,
  },
  blockchain: {
    verify: (documentId: string) => ['blockchain', 'verify', documentId] as const,
  },
  notifications: {
    list: (params?: { limit?: number; offset?: number; unreadOnly?: boolean }) =>
      ['notifications', 'list', params ?? {}] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  requests: {
    all: ['requests'] as const,
    list: (params?: { status?: string }) => ['requests', 'list', params ?? {}] as const,
    mine: ['requests', 'mine'] as const,
  },
  users: {
    profile: ['users', 'profile'] as const,
    search: (email: string) => ['users', 'search', email] as const,
  },
};
