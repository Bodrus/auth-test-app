import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth';
import { ROUTES } from '@/shared/lib';

export default function Index() {
  const { authState } = useAuth();

  if (authState.status === 'loading') return null;

  if (authState.status === 'authenticated') {
    return <Redirect href={ROUTES.protected.profile} />;
  }

  return <Redirect href={ROUTES.public.home} />;
}
