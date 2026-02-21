import * as SecureStore from 'expo-secure-store';

import { SECURE_STORE_KEYS } from '@/shared/lib/constants';
import { tokenStorage } from '../tokenStorage';

const mock = SecureStore as jest.Mocked<typeof SecureStore> & {
  __resetStore: () => void;
};

beforeEach(() => {
  mock.__resetStore();
});

describe('tokenStorage', () => {
  describe('save', () => {
    it('stores both tokens in SecureStore', async () => {
      await tokenStorage.save('access_123', 'refresh_456');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        SECURE_STORE_KEYS.accessToken,
        'access_123',
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        SECURE_STORE_KEYS.refreshToken,
        'refresh_456',
      );
    });
  });

  describe('getAccessToken', () => {
    it('returns saved access token', async () => {
      await tokenStorage.save('access_123', 'refresh_456');

      const token = await tokenStorage.getAccessToken();

      expect(token).toBe('access_123');
    });

    it('returns null when nothing is saved', async () => {
      const token = await tokenStorage.getAccessToken();

      expect(token).toBeNull();
    });

    it('returns null on SecureStore error', async () => {
      mock.getItemAsync.mockRejectedValueOnce(new Error('Keychain unavailable'));

      const token = await tokenStorage.getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('returns saved refresh token', async () => {
      await tokenStorage.save('access_123', 'refresh_456');

      const token = await tokenStorage.getRefreshToken();

      expect(token).toBe('refresh_456');
    });

    it('returns null on SecureStore error', async () => {
      mock.getItemAsync.mockRejectedValueOnce(new Error('Keychain unavailable'));

      const token = await tokenStorage.getRefreshToken();

      expect(token).toBeNull();
    });
  });

  describe('clear', () => {
    it('removes both tokens from SecureStore', async () => {
      await tokenStorage.save('access_123', 'refresh_456');

      await tokenStorage.clear();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SECURE_STORE_KEYS.accessToken,
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SECURE_STORE_KEYS.refreshToken,
      );

      const access = await tokenStorage.getAccessToken();
      const refresh = await tokenStorage.getRefreshToken();
      expect(access).toBeNull();
      expect(refresh).toBeNull();
    });

    it('does not throw on SecureStore error', async () => {
      mock.deleteItemAsync.mockRejectedValueOnce(new Error('Keychain error'));

      await expect(tokenStorage.clear()).resolves.toBeUndefined();
    });
  });
});
