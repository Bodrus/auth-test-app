import { createContext, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { AuthState, User, AuthTokens } from '@/entities/user';
import { setupInterceptors, type InterceptorControls } from '@/shared/api';

import { authApi } from '../api';
import { tokenStorage } from '../lib';

interface AuthContextValue {
  authState: AuthState;
  login: (user: User, tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });
  const queryClient = useQueryClient();
  const controlsRef = useRef<InterceptorControls | null>(null);

  const logout = useCallback(async () => {
    controlsRef.current?.resetState();
    await tokenStorage.clear();
    queryClient.clear();
    setAuthState({ status: 'unauthenticated' });
  }, [queryClient]);

  const login = useCallback(async (user: User, tokens: AuthTokens) => {
    const saved = await tokenStorage.save(tokens.accessToken, tokens.refreshToken);
    if (!saved) throw new Error('Failed to persist tokens');
    setAuthState({ status: 'authenticated', user, tokens });
  }, []);

  // Stable ref so useEffect doesn't re-run when logout identity changes
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    if (!controlsRef.current) {
      controlsRef.current = setupInterceptors({
        getAccessToken: tokenStorage.getAccessToken,
        refreshTokens: async () => {
          const stored = await tokenStorage.getRefreshToken();
          if (!stored) throw new Error('No refresh token');

          const data = await authApi.refreshToken(stored);
          await tokenStorage.save(data.accessToken, data.refreshToken);
          return data.accessToken;
        },
        onRefreshFailed: () => {
          void logoutRef.current();
        },
      });
    }

    const bootstrap = async () => {
      try {
        const hasAccess = await tokenStorage.getAccessToken();
        const hasRefresh = await tokenStorage.getRefreshToken();

        if (!hasAccess || !hasRefresh) {
          setAuthState({ status: 'unauthenticated' });
          return;
        }

        // If token is expired, interceptor handles 401 → refresh → retry
        const user = await authApi.getMe();
        // Re-read tokens: interceptor may have refreshed them during getMe()
        const accessToken = await tokenStorage.getAccessToken();
        const refreshToken = await tokenStorage.getRefreshToken();

        if (!accessToken || !refreshToken) {
          setAuthState({ status: 'unauthenticated' });
          return;
        }

        setAuthState({
          status: 'authenticated',
          user,
          tokens: { accessToken, refreshToken },
        });
      } catch {
        setAuthState({ status: 'unauthenticated' });
      }
    };

    void bootstrap();

    return () => {
      if (controlsRef.current) {
        controlsRef.current.eject();
        controlsRef.current = null;
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
