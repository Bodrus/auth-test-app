import { useState, useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import { authApi } from '../api';
import { createLoginSchema, type LoginFormData } from '../lib';
import { useAuth } from './useAuth';

export const useLoginForm = () => {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- recreate schema when locale changes
  const schema = useMemo(() => createLoginSchema(), [i18n.language]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
    mode: 'onTouched',
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      const { accessToken, refreshToken, ...user } = data;
      await login(user, { accessToken, refreshToken });
    },
    onError: (error: Error) => {
      if (!(error instanceof AxiosError)) {
        setServerError(t('errors.generic'));
        return;
      }
      if (!error.response) {
        setServerError(t('errors.networkError'));
      } else if (error.response.status === 400 || error.response.status === 401) {
        setServerError(t('errors.invalidCredentials'));
      } else {
        setServerError(t('errors.generic'));
      }
    },
  });

  const resetServerError = useCallback(() => {
    setServerError(null);
  }, []);

  const onSubmit = form.handleSubmit(async (data) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      await mutation.mutateAsync(data);
    } catch {
      // Error already handled by onError callback
    } finally {
      submittingRef.current = false;
    }
  });

  return {
    form,
    onSubmit,
    isLoading: mutation.isPending,
    serverError,
    resetServerError,
  };
};
