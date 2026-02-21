import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth';
import { ROUTES } from '@/shared/lib';

export default function PublicLayout() {
  const { authState } = useAuth();

  if (authState.status === 'authenticated') {
    return <Redirect href={ROUTES.protected.profile} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
