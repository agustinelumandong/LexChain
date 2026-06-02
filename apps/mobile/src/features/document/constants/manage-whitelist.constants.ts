export type MobileUserRoleKey = string;

export const MOBILE_USER_ROLES: {
  key: string;
  label: string;
}[] = [
  { key: 'owner', label: 'Owner' },
  { key: 'buyer', label: 'Buyer' },
  { key: 'seller', label: 'Seller' },
  { key: 'participant', label: 'Participant' },
  { key: 'whitelisted', label: 'Whitelisted' },
  { key: 'other', label: 'Other' },
];
