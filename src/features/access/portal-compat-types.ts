import type { ApiSchema } from '@/shared/types/index';

export type PortalAuditLog = {
  id: string;
  document_id: string;
  user_id?: string | null;
  action: string;
  details?: Record<string, unknown> | null;
  created_at: string;
};

export type PortalSearchHit = ApiSchema<'GlobalSearchHit'> & {
  text?: string;
};

export type PortalUserProfile = ApiSchema<'UserProfileResponse'> & {
  mfa_enabled?: boolean;
};
