/** @jest-environment jsdom */
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { type ReactNode } from 'react';

import { AuthProvider } from '../AuthProvider';
import { useAuth } from '../useAuth';
import { authApi } from '../../api';
import { tokenStorage } from '../../lib';
import { setupInterceptors } from '@/shared/api';

const mockEject = jest.fn();
const mockResetState = jest.fn();

jest.mock('@/shared/api', () => ({
  setupInterceptors: jest.fn(() => ({
    eject: mockEject,
    resetState: mockResetState,
  })),
}));

jest.mock('../../api', () => ({
  authApi: {
    login: jest.fn(),
    getMe: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

jest.mock('../../lib', () => ({
  tokenStorage: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    save: jest.fn(),
    clear: jest.fn(),
  },
}));

const mockUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@test.com',
  firstName: 'Emily',
  lastName: 'Smith',
  gender: 'female',
  image: 'https://example.com/avatar.jpg',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  }
  return Wrapper;
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts loading then transitions to unauthenticated when no tokens', async () => {
    (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue(null);
    (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.authState.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.authState.status).toBe('unauthenticated');
    });
  });

  it('sets authenticated when tokens are valid', async () => {
    (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('access-token');
    (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token');
    (authApi.getMe as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.authState.status).toBe('authenticated');
    });

    expect(result.current.authState).toEqual({
      status: 'authenticated',
      user: mockUser,
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    });
  });

  it('sets unauthenticated when getMe fails', async () => {
    (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('expired');
    (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token');
    (authApi.getMe as jest.Mock).mockRejectedValue(new Error('401'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.authState.status).toBe('unauthenticated');
    });
  });

  it('login saves tokens and sets authenticated', async () => {
    (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue(null);
    (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValue(null);
    (tokenStorage.save as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.authState.status).toBe('unauthenticated');
    });

    await act(async () => {
      await result.current.login(mockUser, {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    });

    expect(tokenStorage.save).toHaveBeenCalledWith('new-access', 'new-refresh');
    expect(result.current.authState).toEqual({
      status: 'authenticated',
      user: mockUser,
      tokens: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    });
  });

  it('login throws when tokenStorage.save fails', async () => {
    (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue(null);
    (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValue(null);
    (tokenStorage.save as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.authState.status).toBe('unauthenticated');
    });

    await expect(
      act(() =>
        result.current.login(mockUser, {
          accessToken: 'a',
          refreshToken: 'r',
        }),
      ),
    ).rejects.toThrow('Failed to persist tokens');

    expect(result.current.authState.status).toBe('unauthenticated');
  });

  it('logout clears storage and resets state', async () => {
    (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('access-token');
    (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token');
    (authApi.getMe as jest.Mock).mockResolvedValue(mockUser);
    (tokenStorage.clear as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.authState.status).toBe('authenticated');
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockResetState).toHaveBeenCalled();
    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(result.current.authState.status).toBe('unauthenticated');
  });

  it('ejects interceptors on unmount', async () => {
    (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue(null);
    (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValue(null);

    const { result, unmount } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.authState.status).toBe('unauthenticated');
    });

    unmount();

    expect(mockEject).toHaveBeenCalled();
  });

  it('calls setupInterceptors on mount', async () => {
    (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue(null);
    (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValue(null);

    renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(setupInterceptors).toHaveBeenCalledTimes(1);
    });

    expect(setupInterceptors).toHaveBeenCalledWith({
      getAccessToken: expect.any(Function),
      refreshTokens: expect.any(Function),
      onRefreshFailed: expect.any(Function),
    });
  });
});
