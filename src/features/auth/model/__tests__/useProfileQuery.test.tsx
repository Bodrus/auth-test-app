/** @jest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { type ReactNode } from 'react';

import { useProfileQuery } from '../useProfileQuery';

import { useAuth } from '../useAuth';
import { authApi } from '../../api';

const mockLogout = jest.fn();

jest.mock('@/shared/lib', () => ({
  config: {
    pollingIntervalMs: 30_000,
  },
}));

jest.mock('../useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../api', () => ({
  authApi: {
    getMe: jest.fn(),
  },
}));

const mockUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@test.com',
  firstName: 'Emily',
  lastName: 'Smith',
  gender: 'female',
  image: '',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
};

describe('useProfileQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
  });

  it('does not fetch when unauthenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      authState: { status: 'unauthenticated' },
      logout: mockLogout,
    });

    const { result } = renderHook(() => useProfileQuery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(authApi.getMe).not.toHaveBeenCalled();
  });

  it('fetches when authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      authState: { status: 'authenticated', user: mockUser, tokens: { accessToken: 'a', refreshToken: 'r' } },
      logout: mockLogout,
    });
    (authApi.getMe as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useProfileQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authApi.getMe).toHaveBeenCalled();
  });

  it('triggers logout on 401 error', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      authState: { status: 'authenticated', user: mockUser, tokens: { accessToken: 'a', refreshToken: 'r' } },
      logout: mockLogout,
    });

    const error = new AxiosError(
      'Unauthorized',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 401,
        data: {},
        headers: {},
        statusText: 'Unauthorized',
        config: { headers: new AxiosHeaders() },
      },
    );
    (authApi.getMe as jest.Mock).mockRejectedValue(error);

    renderHook(() => useProfileQuery(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('does not trigger logout on non-401 error', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      authState: { status: 'authenticated', user: mockUser, tokens: { accessToken: 'a', refreshToken: 'r' } },
      logout: mockLogout,
    });
    (authApi.getMe as jest.Mock).mockRejectedValue(new Error('Server down'));

    const { result } = renderHook(() => useProfileQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockLogout).not.toHaveBeenCalled();
  });
});
