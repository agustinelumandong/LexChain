import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants';
import { useDocumentsStore } from '@/features/documents/use-documents-store';
import { useProfileSettingsStore } from '@/features/profile/profile-settings-store';
import { queryClient } from '@/shared/providers';
import { authTokenStorage, refreshTokenStorage } from '@/shared/utils/secure-storage';

const SESSION_STORAGE_KEYS = [
  STORAGE_KEYS.documentWhitelist,
  STORAGE_KEYS.documentsStore,
  STORAGE_KEYS.profileSettings,
];

export async function clearSessionData() {
  useDocumentsStore.getState().resetDocumentsStore();
  useProfileSettingsStore.getState().resetProfileSettings();
  queryClient.clear();

  await Promise.all([
    authTokenStorage.delete(),
    refreshTokenStorage.delete(),
    AsyncStorage.multiRemove(SESSION_STORAGE_KEYS),
  ]);
}
