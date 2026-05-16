import type { DocumentAccessRole, DocumentPermission } from '@/types';

export const permissionsByRole: Record<DocumentAccessRole, DocumentPermission> = {
  owner: {
    canViewPdf: true,
    canViewSummary: true,
    canViewOcrText: true,
    canAskDocument: true,
    canInviteUsers: true,
    canVerifyDocument: true,
    canDownloadPdf: true,
  },
  editor: {
    canViewPdf: true,
    canViewSummary: true,
    canViewOcrText: true,
    canAskDocument: true,
    canInviteUsers: true,
    canVerifyDocument: false,
    canDownloadPdf: true,
  },
  viewer: {
    canViewPdf: true,
    canViewSummary: true,
    canViewOcrText: false,
    canAskDocument: false,
    canInviteUsers: false,
    canVerifyDocument: false,
    canDownloadPdf: false,
  },
  verifier: {
    canViewPdf: true,
    canViewSummary: true,
    canViewOcrText: true,
    canAskDocument: false,
    canInviteUsers: false,
    canVerifyDocument: true,
    canDownloadPdf: false,
  },
};

export function normalizeDocumentRole(role?: string): DocumentAccessRole {
  if (
    role === 'owner' ||
    role === 'editor' ||
    role === 'viewer' ||
    role === 'verifier'
  ) {
    return role;
  }

  return 'viewer';
}

export function getDocumentPermissions(role?: string): DocumentPermission {
  return permissionsByRole[normalizeDocumentRole(role)];
}
