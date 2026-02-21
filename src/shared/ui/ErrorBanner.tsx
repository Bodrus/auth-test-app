import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, DIMENSIONS } from '../lib/theme';
import { AppText } from './AppText';

const ICON_SIZE = 20;
const ICON_MARGIN = 12;

interface ErrorBannerProps {
  message: string;
  style?: ViewStyle;
}

export const ErrorBanner = ({ message, style }: ErrorBannerProps) => (
  <Animated.View
    entering={FadeIn.duration(250)}
    exiting={FadeOut.duration(200)}
    accessibilityRole="alert"
    accessibilityLiveRegion="assertive"
    style={[styles.container, style]}
  >
    <Ionicons
      name="alert-circle"
      size={ICON_SIZE}
      color={COLORS.errorBannerText}
    />
    <AppText variant="errorBannerText" style={styles.text}>{message}</AppText>
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    height: DIMENSIONS.errorBanner.height,
    borderRadius: DIMENSIONS.errorBanner.borderRadius,
    backgroundColor: COLORS.errorBannerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.input.paddingHorizontal,
  },
  text: {
    marginLeft: ICON_MARGIN,
    flex: 1,
  },
});
