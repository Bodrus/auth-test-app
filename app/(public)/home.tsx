import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/shared/lib';
import { AppButton, ScreenContainer } from '@/shared/ui';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ScreenContainer centered>
      <AppButton
        label={t('home.goToLogin')}
        onPress={() => router.push(ROUTES.public.login)}
      />
    </ScreenContainer>
  );
}
