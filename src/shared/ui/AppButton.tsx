import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, DIMENSIONS, SHADOWS } from '../lib/theme';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: AppButtonProps) => {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  const content: ReactNode = loading ? (
    <ActivityIndicator color={isPrimary ? COLORS.btnText : COLORS.btnSecondaryText} />
  ) : (
    <AppText variant={isPrimary ? 'buttonLabel' : 'secondaryButtonLabel'}>
      {label}
    </AppText>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        isPrimary && styles.shadow,
        style,
        pressed && styles.pressed,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={[COLORS.btnGradientStart, COLORS.btnGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.primary, isDisabled && styles.disabled]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.secondary, isDisabled && styles.disabled]}>
          {content}
        </View>
      )}
    </Pressable>
  );
};

const baseButton: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
};

const styles = StyleSheet.create({
  primary: {
    ...baseButton,
    height: DIMENSIONS.primaryButton.height,
    borderRadius: DIMENSIONS.primaryButton.borderRadius,
    paddingHorizontal: DIMENSIONS.primaryButton.paddingHorizontal,
  },
  shadow: {
    ...SHADOWS.primaryButton,
    borderRadius: DIMENSIONS.primaryButton.borderRadius,
  },
  secondary: {
    ...baseButton,
    height: DIMENSIONS.secondaryButton.height,
    borderRadius: DIMENSIONS.secondaryButton.borderRadius,
    paddingHorizontal: DIMENSIONS.secondaryButton.paddingHorizontal,
    backgroundColor: COLORS.btnSecondaryBg,
  },
  disabled: {
    opacity: 0.32,
  },
  pressed: {
    opacity: 0.8,
  },
});
