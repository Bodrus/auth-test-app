import { LoginForm } from '@/features/auth';
import { ScreenContainer } from '@/shared/ui';

export default function LoginScreen() {
  return (
    <ScreenContainer centered>
      <LoginForm />
    </ScreenContainer>
  );
}
