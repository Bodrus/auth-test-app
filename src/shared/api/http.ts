import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../lib/config';

export const http = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeoutMs,
});

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

interface InterceptorDeps {
  getAccessToken: () => Promise<string | null>;
  refreshTokens: () => Promise<string>;
  onRefreshFailed: () => void;
}

export interface InterceptorControls {
  eject: () => void;
  resetState: () => void;
}

export const setupInterceptors = ({
  getAccessToken,
  refreshTokens,
  onRefreshFailed,
}: InterceptorDeps): InterceptorControls => {
  let isRefreshing = false;
  let failedQueue: FailedRequest[] = [];

  const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach((pending) => {
      if (token) {
        pending.resolve(token);
      } else {
        pending.reject(error);
      }
    });
    failedQueue = [];
  };

  const resetState = () => {
    isRefreshing = false;
    failedQueue = [];
  };

  const requestId = http.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const responseId = http.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (!originalRequest || error.response?.status !== 401) {
        return Promise.reject(error);
      }

      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');
      if (isRefreshRequest || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return http(originalRequest);
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const newToken = await refreshTokens();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        onRefreshFailed();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return {
    eject: () => {
      http.interceptors.request.eject(requestId);
      http.interceptors.response.eject(responseId);
      resetState();
    },
    resetState,
  };
};
