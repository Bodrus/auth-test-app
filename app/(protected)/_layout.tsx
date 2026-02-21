import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth';
import { ROUTES } from '@/shared/lib';

export default function ProtectedLayout() {
  const { authState } = useAuth();

  if (authState.status === 'loading') return null;

  if (authState.status === 'unauthenticated') {
    return <Redirect href={ROUTES.public.home} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
