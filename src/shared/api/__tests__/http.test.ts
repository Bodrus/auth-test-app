import MockAdapter from 'axios-mock-adapter';

import { http, setupInterceptors } from '../http';

let mockAdapter: MockAdapter;
let getAccessToken: jest.Mock<Promise<string | null>>;
let refreshTokens: jest.Mock<Promise<string>>;
let onRefreshFailed: jest.Mock;

beforeEach(() => {
  // Reset axios instance interceptors by ejecting all
  http.interceptors.request.clear();
  http.interceptors.response.clear();

  mockAdapter = new MockAdapter(http);

  getAccessToken = jest.fn<Promise<string | null>, []>().mockResolvedValue(null);
  refreshTokens = jest.fn<Promise<string>, []>();
  onRefreshFailed = jest.fn();

  setupInterceptors({ getAccessToken, refreshTokens, onRefreshFailed });
});

afterEach(() => {
  mockAdapter.restore();
});

describe('request interceptor', () => {
  it('attaches Bearer token when getAccessToken returns a token', async () => {
    getAccessToken.mockResolvedValue('my-token');
    mockAdapter.onGet('/test').reply(200, { ok: true });

    const response = await http.get('/test');

    expect(response.config.headers.Authorization).toBe('Bearer my-token');
  });

  it('sends no Authorization header when token is null', async () => {
    getAccessToken.mockResolvedValue(null);
    mockAdapter.onGet('/test').reply(200, { ok: true });

    const response = await http.get('/test');

    expect(response.config.headers.Authorization).toBeUndefined();
  });
});

describe('response interceptor', () => {
  it('passes through successful responses unchanged', async () => {
    mockAdapter.onGet('/data').reply(200, { value: 42 });

    const response = await http.get('/data');

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ value: 42 });
  });

  it('rejects non-401 errors without refresh attempt', async () => {
    mockAdapter.onGet('/data').reply(500, { message: 'Server error' });

    await expect(http.get('/data')).rejects.toMatchObject({
      response: { status: 500 },
    });

    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it('refreshes token and retries with new token on 401', async () => {
    getAccessToken.mockResolvedValue('expired-token');
    refreshTokens.mockImplementation(async () => {
      // In production, refreshTokens saves new token — getAccessToken then returns it
      getAccessToken.mockResolvedValue('new-token');
      return 'new-token';
    });

    let retryHeaders: string | undefined;
    let callCount = 0;
    mockAdapter.onGet('/protected').reply((config) => {
      callCount++;
      if (callCount === 1) return [401, { message: 'Unauthorized' }];
      retryHeaders = config.headers?.Authorization as string | undefined;
      return [200, { data: 'success' }];
    });

    const response = await http.get('/protected');

    expect(refreshTokens).toHaveBeenCalledTimes(1);
    expect(retryHeaders).toBe('Bearer new-token');
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ data: 'success' });
  });

  it('rejects immediately on 401 for /auth/refresh (no infinite loop)', async () => {
    getAccessToken.mockResolvedValue('some-token');
    mockAdapter.onPost('/auth/refresh').reply(401, { message: 'Invalid token' });

    await expect(http.post('/auth/refresh')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it('calls onRefreshFailed and rejects when refresh fails', async () => {
    getAccessToken.mockResolvedValue('expired-token');
    refreshTokens.mockRejectedValue(new Error('Refresh failed'));
    mockAdapter.onGet('/protected').reply(401, { message: 'Unauthorized' });

    await expect(http.get('/protected')).rejects.toThrow('Refresh failed');

    expect(onRefreshFailed).toHaveBeenCalledTimes(1);
  });

  it('queues concurrent 401s and makes only one refresh call', async () => {
    getAccessToken.mockResolvedValue('expired-token');
    refreshTokens.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('new-token'), 50)),
    );

    let callCounts: Record<string, number> = {};
    mockAdapter.onGet(/\/api\/\d/).reply((config) => {
      const url = config.url!;
      callCounts[url] = (callCounts[url] ?? 0) + 1;
      if (callCounts[url] === 1) return [401, { message: 'Unauthorized' }];
      return [200, { url }];
    });

    const [r1, r2, r3] = await Promise.all([
      http.get('/api/1'),
      http.get('/api/2'),
      http.get('/api/3'),
    ]);

    expect(refreshTokens).toHaveBeenCalledTimes(1);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(200);
  });

  it('rejects all queued requests when refresh fails', async () => {
    getAccessToken.mockResolvedValue('expired-token');
    refreshTokens.mockImplementation(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Refresh failed')), 50),
        ),
    );

    mockAdapter.onGet(/\/api\/\d/).reply(401, { message: 'Unauthorized' });

    const results = await Promise.allSettled([
      http.get('/api/1'),
      http.get('/api/2'),
    ]);

    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(onRefreshFailed).toHaveBeenCalledTimes(1);
  });
});
