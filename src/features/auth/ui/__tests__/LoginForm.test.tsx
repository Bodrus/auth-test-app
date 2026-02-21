/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { type ReactNode } from 'react';

import { LoginForm } from '../LoginForm';

jest.mock('react-native-reanimated', () => {
  return {
    __esModule: true,
    default: {
      View: ({ children, ...props }: Record<string, unknown>) => (
        <div {...props}>{children as React.ReactNode}</div>
      ),
      Text: ({ children, ...props }: Record<string, unknown>) => (
        <span {...props}>{children as React.ReactNode}</span>
      ),
      createAnimatedComponent: (comp: unknown) => comp,
    },
    useSharedValue: (val: number) => ({ value: val }),
    useAnimatedStyle: () => ({}),
    useDerivedValue: (fn: () => number) => ({ value: fn() }),
    withTiming: (val: number) => val,
    interpolate: () => 0,
    interpolateColor: () => 'transparent',
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: unknown;
  }) => <div style={style as React.CSSProperties}>{children}</div>,
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../../model/useAuth', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

jest.mock('../../api', () => ({
  authApi: { login: jest.fn() },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('LoginForm', () => {
  it('renders username and password inputs', () => {
    render(<LoginForm />, { wrapper: createWrapper() });
    expect(screen.getByText('Username')).toBeTruthy();
    expect(screen.getByText('Password')).toBeTruthy();
  });

  it('renders submit button', () => {
    render(<LoginForm />, { wrapper: createWrapper() });
    expect(screen.getByText('Login')).toBeTruthy();
  });

  it('submit button is disabled when fields are empty', () => {
    render(<LoginForm />, { wrapper: createWrapper() });
    const button = screen.getByRole('button', { name: 'Login' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });
});
