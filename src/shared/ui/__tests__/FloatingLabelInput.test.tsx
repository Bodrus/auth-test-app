/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';

import { FloatingLabelInput } from '../FloatingLabelInput';

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

describe('FloatingLabelInput', () => {
  it('renders label', () => {
    render(
      <FloatingLabelInput label="Username" value="" onChangeText={jest.fn()} />,
    );
    expect(screen.getByText('Username')).toBeTruthy();
  });

  it('calls onChangeText', () => {
    const onChangeText = jest.fn();
    render(
      <FloatingLabelInput label="Username" value="" onChangeText={onChangeText} />,
    );
    const input = screen.getByLabelText('Username');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(onChangeText).toHaveBeenCalled();
  });

  it('shows error message when error is true', () => {
    render(
      <FloatingLabelInput
        label="Username"
        value=""
        onChangeText={jest.fn()}
        error
        errorMessage="Required"
      />,
    );
    expect(screen.getByText('Required')).toBeTruthy();
  });

  it('shows clear button when value is present and onClear provided', () => {
    render(
      <FloatingLabelInput
        label="Username"
        value="test"
        onChangeText={jest.fn()}
        onClear={jest.fn()}
      />,
    );
    expect(screen.getByLabelText('Clear input')).toBeTruthy();
  });

  it('calls onClear when clear button is pressed', () => {
    const onClear = jest.fn();
    render(
      <FloatingLabelInput
        label="Username"
        value="test"
        onChangeText={jest.fn()}
        onClear={onClear}
      />,
    );
    fireEvent.click(screen.getByLabelText('Clear input'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
