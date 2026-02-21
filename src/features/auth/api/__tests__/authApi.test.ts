import MockAdapter from 'axios-mock-adapter';

import { http } from '@/shared/api';
import { config } from '@/shared/lib/config';

import { authApi } from '../authApi';

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

let mockAdapter: MockAdapter;

beforeEach(() => {
  mockAdapter = new MockAdapter(http);
});

afterEach(() => {
  mockAdapter.restore();
});

const validUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@test.com',
  firstName: 'Emily',
  lastName: 'Smith',
  gender: 'female',
  image: 'https://example.com/avatar.jpg',
};

const validTokens = {
  accessToken: 'access-abc',
  refreshToken: 'refresh-xyz',
};

describe('authApi.login', () => {
  it('sends credentials with expiresInMins from config', async () => {
    mockAdapter.onPost('/auth/login').reply(200, { ...validUser, ...validTokens });

    await authApi.login({ username: 'emilys', password: 'pass123' });

    const requestData = JSON.parse(mockAdapter.history.post[0].data as string);
    expect(requestData).toEqual({
      username: 'emilys',
      password: 'pass123',
      expiresInMins: config.tokenExpiresInMins,
    });
  });

  it('returns parsed user and tokens on valid response', async () => {
    mockAdapter.onPost('/auth/login').reply(200, { ...validUser, ...validTokens });

    const result = await authApi.login({ username: 'emilys', password: 'pass123' });

    expect(result).toEqual({ ...validUser, ...validTokens });
  });

  it('throws when response is missing required fields', async () => {
    mockAdapter.onPost('/auth/login').reply(200, { id: 1, username: 'emilys' });

    await expect(
      authApi.login({ username: 'emilys', password: 'pass123' }),
    ).rejects.toThrow();
  });

  it('throws when tokens are empty strings', async () => {
    mockAdapter.onPost('/auth/login').reply(200, {
      ...validUser,
      accessToken: '',
      refreshToken: '',
    });

    await expect(
      authApi.login({ username: 'emilys', password: 'pass123' }),
    ).rejects.toThrow();
  });
});

describe('authApi.getMe', () => {
  it('returns parsed user on valid response', async () => {
    mockAdapter.onGet('/auth/me').reply(200, validUser);

    const result = await authApi.getMe();

    expect(result).toEqual(validUser);
  });

  it('throws when response has wrong types', async () => {
    mockAdapter.onGet('/auth/me').reply(200, { ...validUser, id: 'not-a-number' });

    await expect(authApi.getMe()).rejects.toThrow();
  });
});

describe('authApi.refreshToken', () => {
  it('sends refresh token with expiresInMins from config', async () => {
    mockAdapter.onPost('/auth/refresh').reply(200, validTokens);

    await authApi.refreshToken('old-refresh');

    const requestData = JSON.parse(mockAdapter.history.post[0].data as string);
    expect(requestData).toEqual({
      refreshToken: 'old-refresh',
      expiresInMins: config.tokenExpiresInMins,
    });
  });

  it('returns parsed tokens on valid response', async () => {
    mockAdapter.onPost('/auth/refresh').reply(200, validTokens);

    const result = await authApi.refreshToken('old-refresh');

    expect(result).toEqual(validTokens);
  });

  it('throws when accessToken is missing', async () => {
    mockAdapter.onPost('/auth/refresh').reply(200, { refreshToken: 'new-refresh' });

    await expect(authApi.refreshToken('old-refresh')).rejects.toThrow();
  });
});
