import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Keyboard,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '../lib/theme';

interface ScreenContainerProps {
  children: ReactNode;
  centered?: boolean;
  paddingHorizontal?: number;
  style?: ViewStyle;
}

export const ScreenContainer = ({
  children,
  centered,
  paddingHorizontal = SPACING.screenHorizontal,
  style,
}: ScreenContainerProps) => (
  <SafeAreaView style={[styles.safe, { paddingHorizontal }, style]}>
    <KeyboardAvoidingView
      style={[styles.keyboard, centered && styles.centered]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={[styles.pressable, centered && styles.centered]} onPress={Keyboard.dismiss}>
        {children}
      </Pressable>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  keyboard: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
  },
  pressable: {
    flex: 1,
  },
});
