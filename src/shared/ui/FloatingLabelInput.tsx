import { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import i18n from 'i18next';

import { COLORS, DIMENSIONS, FONTS, TYPOGRAPHY } from '../lib/theme';
import { AppText } from './AppText';

const DURATION = 150;
const LABEL_LEFT = 12;
const LABEL_PAD_H = 4;
const CLEAR_RIGHT = 12;

// Label resting Y = vertically centered in input
const LABEL_TOP = 16;
// Label floated Y = 6px from top border of input
const LABEL_FLOATED_TOP = 6;
const LABEL_FLOATED_Y = LABEL_FLOATED_TOP - LABEL_TOP;

// Label background: transparent at rest so cursor shows through,
// opaque white when floated to create border-notch effect
const LABEL_BG_REST = 'rgba(255, 255, 255, 0)';
const LABEL_BG_FLOATED = COLORS.inputBg;

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: boolean;
  errorMessage?: string;
  secureTextEntry?: boolean;
  onClear?: () => void;
  editable?: boolean;
}

export const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  errorMessage,
  secureTextEntry,
  onClear,
  editable = true,
}: FloatingLabelInputProps) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  // 0 = resting (center, placeholder role), 1 = floated (top, label role)
  const progress = useSharedValue(hasValue ? 1 : 0);

  const errorSV = useDerivedValue(() => (error ? 1 : 0), [error]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    progress.value = withTiming(1, { duration: DURATION });
  }, [progress]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!hasValue) {
      progress.value = withTiming(0, { duration: DURATION });
    }
    onBlur?.();
  }, [progress, hasValue, onBlur]);

  const handleClear = useCallback(() => {
    onClear?.();
    inputRef.current?.focus();
  }, [onClear]);

  // Border: error → red, focused/hasValue → blue, default → grey
  const isFocusedOrFilled = isFocused || hasValue;
  const borderColor = error
    ? COLORS.inputBorderError
    : isFocusedOrFilled
      ? COLORS.inputBorderFocused
      : COLORS.inputBorderDefault;

  const labelAnimStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, LABEL_FLOATED_Y]);
    const fontSize = interpolate(progress.value, [0, 1], [16, 12]);
    const lineHeight = interpolate(progress.value, [0, 1], [22.4, 16.8]);

    const isError = errorSV.value === 1;
    const restCol = isError ? COLORS.inputBorderError : COLORS.inputPlaceholder;
    const activeCol = isError ? COLORS.inputLabelError : COLORS.inputLabelFocused;

    const color = interpolateColor(progress.value, [0, 1], [restCol, activeCol]);
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [LABEL_BG_REST, LABEL_BG_FLOATED],
    );

    return {
      transform: [{ translateY }],
      fontSize,
      lineHeight,
      color,
      backgroundColor,
    };
  });

  return (
    <View>
      <View style={[styles.container, { borderColor }]}>
        <Animated.Text
          style={[styles.label, labelAnimStyle]}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={COLORS.inputBorderFocused}
          cursorColor={COLORS.inputBorderFocused}
          accessibilityLabel={label}
        />

        {hasValue && onClear && (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={i18n.t('accessibility.clearInput')}
          >
            <Ionicons
              name="close-circle"
              size={DIMENSIONS.clearButton.size}
              color={COLORS.clearButtonIcon}
            />
          </Pressable>
        )}
      </View>

      {error && errorMessage ? (
        <AppText variant="errorText" style={styles.errorText}>{errorMessage}</AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: DIMENSIONS.input.height,
    borderRadius: DIMENSIONS.input.borderRadius,
    borderWidth: DIMENSIONS.input.borderWidth,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: DIMENSIONS.input.paddingHorizontal,
  },
  label: {
    position: 'absolute',
    left: LABEL_LEFT,
    top: LABEL_TOP,
    paddingHorizontal: LABEL_PAD_H,
    fontFamily: FONTS.regular,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.inputValue,
    paddingRight: DIMENSIONS.clearButton.size + CLEAR_RIGHT,
    paddingTop: 24,
    paddingBottom: 6,
  },
  clearButton: {
    position: 'absolute',
    right: CLEAR_RIGHT,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 4,
  },
});
