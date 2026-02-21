/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';

import { AppButton } from '../AppButton';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: unknown;
  }) => <div style={style as React.CSSProperties}>{children}</div>,
}));

describe('AppButton', () => {
  it('renders primary variant by default', () => {
    render(<AppButton label="Login" onPress={jest.fn()} />);
    expect(screen.getByText('Login')).toBeTruthy();
  });

  it('renders secondary variant', () => {
    render(<AppButton label="Logout" variant="secondary" onPress={jest.fn()} />);
    expect(screen.getByText('Logout')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<AppButton label="Press me" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<AppButton label="Press me" onPress={onPress} disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when loading', () => {
    render(<AppButton label="Login" onPress={jest.fn()} loading />);
    expect(screen.queryByText('Login')).toBeNull();
  });
});
