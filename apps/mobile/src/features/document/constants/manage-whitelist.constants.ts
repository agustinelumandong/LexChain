export type MobileUserRoleKey = 'participant' | 'owner' | 'lawyer';

export const MOBILE_USER_ROLES: {
  key: MobileUserRoleKey;
  label: string;
}[] = [
  { key: 'participant', label: 'Witness/Participant' },
  { key: 'owner', label: 'Owner' },
  { key: 'lawyer', label: 'Lawyer' },
];
