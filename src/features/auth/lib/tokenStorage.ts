import * as SecureStore from 'expo-secure-store';

import { SECURE_STORE_KEYS } from '@/shared/lib/constants';

export const tokenStorage = {
  getAccessToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(SECURE_STORE_KEYS.accessToken);
    } catch {
      return null;
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(SECURE_STORE_KEYS.refreshToken);
    } catch {
      return null;
    }
  },

  save: async (accessToken: string, refreshToken: string): Promise<boolean> => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(SECURE_STORE_KEYS.accessToken, accessToken),
        SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, refreshToken),
      ]);
      return true;
    } catch {
      return false;
    }
  },

  clear: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.accessToken);
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken);
    } catch {
      // Best-effort cleanup — tokens may already be missing
    }
  },
};
