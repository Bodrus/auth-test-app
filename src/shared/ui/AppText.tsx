import { Text, TextProps, TextStyle, StyleSheet } from 'react-native';

import { FONTS, TYPOGRAPHY } from '../lib/theme';

type TypographyVariant = keyof typeof TYPOGRAPHY;
type TextAlign = 'left' | 'center' | 'right' | 'auto';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: TextAlign;
}

export const AppText = ({
  variant,
  color,
  align,
  style,
  ...props
}: AppTextProps) => {
  const variantStyle = variant ? TYPOGRAPHY[variant] : undefined;

  const overrides: TextStyle | undefined =
    color || align
      ? { ...(color && { color }), ...(align && { textAlign: align }) }
      : undefined;

  return (
    <Text style={[styles.base, variantStyle, overrides, style]} {...props} />
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: FONTS.regular,
  },
});
