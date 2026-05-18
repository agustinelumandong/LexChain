import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/constants';

type SecureStorageKey =
  | typeof STORAGE_KEYS.authToken
  | typeof STORAGE_KEYS.refreshToken;

export const secureStorage = {
  async set(key: SecureStorageKey, value: string) {
    await SecureStore.setItemAsync(key, value);
  },

  async get(key: SecureStorageKey) {
    return await SecureStore.getItemAsync(key);
  },

  async delete(key: SecureStorageKey) {
    await SecureStore.deleteItemAsync(key);
  },
};

export const authTokenStorage = {
  async set(token: string) {
    await secureStorage.set(STORAGE_KEYS.authToken, token);
  },

  async get() {
    return secureStorage.get(STORAGE_KEYS.authToken);
  },

  async delete() {
    await secureStorage.delete(STORAGE_KEYS.authToken);
  },
};

export const refreshTokenStorage = {
  async set(token: string) {
    await secureStorage.set(STORAGE_KEYS.refreshToken, token);
  },

  async get() {
    return secureStorage.get(STORAGE_KEYS.refreshToken);
  },

  async delete() {
    await secureStorage.delete(STORAGE_KEYS.refreshToken);
  },
};
