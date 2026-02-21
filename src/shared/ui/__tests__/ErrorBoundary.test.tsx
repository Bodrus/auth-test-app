/** @jest-environment jsdom */
// __DEV__ is a React Native global not set in jsdom — define it for tests
import { render, screen, fireEvent } from '@testing-library/react';

import { ErrorBoundary } from '../ErrorBoundary';

(global as Record<string, unknown>).__DEV__ = true;

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: unknown;
  }) => <div style={style as React.CSSProperties}>{children}</div>,
}));

let shouldThrow = false;

const ThrowingChild = () => {
  if (shouldThrow) throw new Error('Test error');
  return <div>Child content</div>;
};

// Suppress React error boundary console noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});
afterEach(() => {
  shouldThrow = false;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('shows default fallback UI when child throws', () => {
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('shows custom fallback when provided', () => {
    shouldThrow = true;
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom fallback')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });

  it('recovers when retry button is pressed and error is resolved', () => {
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();

    // Resolve the error condition before clicking retry
    shouldThrow = false;
    fireEvent.click(screen.getByText('Try again'));

    expect(screen.getByText('Child content')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });
});
