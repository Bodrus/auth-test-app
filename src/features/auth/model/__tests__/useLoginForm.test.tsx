/** @jest-environment jsdom */
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { type ReactNode } from 'react';

import { en } from '@/shared/lib/i18n/locales/en';

import { useLoginForm } from '../useLoginForm';

import { authApi } from '../../api';

const mockLogin = jest.fn();

jest.mock('../useAuth', () => ({
  useAuth: jest.fn(() => ({
    login: mockLogin,
  })),
}));

jest.mock('../../api', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

const mockLoginResponse = {
  id: 1,
  username: 'emilys',
  email: 'emily@test.com',
  firstName: 'Emily',
  lastName: 'Smith',
  gender: 'female',
  image: '',
  accessToken: 'access',
  refreshToken: 'refresh',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 0 } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
};

const setValidFormValues = (form: ReturnType<typeof useLoginForm>['form']) => {
  form.setValue('username', 'emilys');
  form.setValue('password', 'emilyspass');
};

const create401Error = () =>
  new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 401,
    data: {},
    headers: {},
    statusText: 'Unauthorized',
    config: { headers: new AxiosHeaders() },
  });

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
  });

  it('initializes with no server error and not loading', () => {
    const { result } = renderHook(() => useLoginForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.serverError).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('calls login on successful mutation', async () => {
    (authApi.login as jest.Mock).mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useLoginForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      setValidFormValues(result.current.form);
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        {
          id: 1,
          username: 'emilys',
          email: 'emily@test.com',
          firstName: 'Emily',
          lastName: 'Smith',
          gender: 'female',
          image: '',
        },
        { accessToken: 'access', refreshToken: 'refresh' },
      );
    });
  });

  it('sets network error on AxiosError without response', async () => {
    (authApi.login as jest.Mock).mockRejectedValue(
      new AxiosError('Network Error', 'ERR_NETWORK'),
    );

    const { result } = renderHook(() => useLoginForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      setValidFormValues(result.current.form);
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.serverError).toBe(en.errors.networkError);
    });
  });

  it('sets invalid credentials on 401', async () => {
    (authApi.login as jest.Mock).mockRejectedValue(create401Error());

    const { result } = renderHook(() => useLoginForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      setValidFormValues(result.current.form);
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.serverError).toBe(en.errors.invalidCredentials);
    });
  });

  it('sets invalid credentials on 400', async () => {
    const error = new AxiosError('Bad Request', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      data: {},
      headers: {},
      statusText: 'Bad Request',
      config: { headers: new AxiosHeaders() },
    });
    (authApi.login as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useLoginForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      setValidFormValues(result.current.form);
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.serverError).toBe(en.errors.invalidCredentials);
    });
  });

  it('sets generic error on non-Axios error', async () => {
    (authApi.login as jest.Mock).mockRejectedValue(new Error('Unknown'));

    const { result } = renderHook(() => useLoginForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      setValidFormValues(result.current.form);
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.serverError).toBe(en.errors.generic);
    });
  });

  it('resets server error', async () => {
    (authApi.login as jest.Mock).mockRejectedValue(create401Error());

    const { result } = renderHook(() => useLoginForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      setValidFormValues(result.current.form);
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.serverError).not.toBeNull();
    });

    act(() => {
      result.current.resetServerError();
    });

    expect(result.current.serverError).toBeNull();
  });
});
