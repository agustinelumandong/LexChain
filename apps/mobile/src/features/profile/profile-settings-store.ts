import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants';

export type ProfileAccount = {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
};

export type NotificationSettings = {
  uploadProcessing: boolean;
  verificationActivity: boolean;
  whitelistChanges: boolean;
  productSecurity: boolean;
};

export type SecuritySettings = {
  biometricUnlock: boolean;
  fasterSignIn: boolean;
  trustedDeviceAlerts: boolean;
};

type ProfileSettingsStore = {
  account: ProfileAccount;
  notifications: NotificationSettings;
  security: SecuritySettings;
  updateAccount: (account: ProfileAccount) => void;
  updateNotification: (key: keyof NotificationSettings, value: boolean) => void;
  updateSecurity: (key: keyof SecuritySettings, value: boolean) => void;
  resetProfileSettings: () => void;
};

export const DEFAULT_PROFILE_ACCOUNT: ProfileAccount = {
  firstName: 'Carl',
  lastName: 'Shan',
  role: 'lawyer',
  email: 'carl.shan@lexchain.app',
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  uploadProcessing: true,
  verificationActivity: true,
  whitelistChanges: true,
  productSecurity: false,
};

const DEFAULT_SECURITY: SecuritySettings = {
  biometricUnlock: false,
  fasterSignIn: true,
  trustedDeviceAlerts: true,
};

export const getProfileDisplayName = (account: ProfileAccount) =>
  `${account.firstName} ${account.lastName}`.trim() || 'LexChain User';

export const getProfileInitials = (account: ProfileAccount) => {
  const first = account.firstName.trim().charAt(0);
  const last = account.lastName.trim().charAt(0);
  const initials = `${first}${last}`.toUpperCase();

  return initials || 'LC';
};

export const canRoleUploadDocuments = (role?: string) =>
  role?.trim().toLowerCase() === 'lawyer';

export const canProfileUploadDocuments = (account: ProfileAccount) =>
  canRoleUploadDocuments(account.role);

export const useProfileSettingsStore = create<ProfileSettingsStore>()(
  persist(
    (set) => ({
      account: DEFAULT_PROFILE_ACCOUNT,
      notifications: DEFAULT_NOTIFICATIONS,
      security: DEFAULT_SECURITY,
      updateAccount: (account) => {
        set({ account });
      },
      updateNotification: (key, value) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        }));
      },
      updateSecurity: (key, value) => {
        set((state) => ({
          security: {
            ...state.security,
            [key]: value,
          },
        }));
      },
      resetProfileSettings: () => {
        set({
          account: DEFAULT_PROFILE_ACCOUNT,
          notifications: DEFAULT_NOTIFICATIONS,
          security: DEFAULT_SECURITY,
        });
      },
    }),
    {
      name: STORAGE_KEYS.profileSettings,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
