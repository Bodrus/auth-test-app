/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';

import { ErrorBanner } from '../ErrorBanner';

jest.mock('react-native-reanimated', () => {
  return {
    __esModule: true,
    default: {
      View: ({
        children,
        accessibilityRole,
        accessibilityLiveRegion,
        ...props
      }: Record<string, unknown>) => (
        <div
          role={accessibilityRole as string}
          aria-live={accessibilityLiveRegion as 'off' | 'assertive' | 'polite'}
          {...props}
        >
          {children as React.ReactNode}
        </div>
      ),
      createAnimatedComponent: (comp: unknown) => comp,
    },
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('ErrorBanner', () => {
  it('renders error message', () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('has alert accessibility role', () => {
    render(<ErrorBanner message="Error" />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
