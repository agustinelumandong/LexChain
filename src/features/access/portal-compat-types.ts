import type { ApiSchema } from '@/shared/types/index';

export type PortalSearchHit = ApiSchema<'GlobalSearchHit'> & {
  text?: string;
};

export type PortalUserProfile = ApiSchema<'UserProfileResponse'> & {
  mfa_enabled?: boolean;
};
