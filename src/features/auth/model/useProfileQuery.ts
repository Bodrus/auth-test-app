import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { config } from '@/shared/lib';

import { authApi } from '../api';
import { authKeys } from './authKeys';
import { useAuth } from './useAuth';

export const useProfileQuery = () => {
  const { authState, logout } = useAuth();
  const isAuthenticated = authState.status === 'authenticated';

  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    refetchInterval: config.pollingIntervalMs,
    refetchIntervalInBackground: false,
  });

  const isAuthError =
    query.error instanceof AxiosError &&
    query.error.response?.status === 401 &&
    !query.isFetching;

  useEffect(() => {
    if (isAuthError && isAuthenticated) {
      void logout();
    }
  }, [isAuthError, isAuthenticated, logout]);

  return query;
};
