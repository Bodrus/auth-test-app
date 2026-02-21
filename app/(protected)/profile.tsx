import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth, useProfileQuery } from '@/features/auth';
import { COLORS, DIMENSIONS, SPACING } from '@/shared/lib';
import { AppButton, AppText, ScreenContainer } from '@/shared/ui';

const HEADER_ICON_SIZE = DIMENSIONS.headerIcon.size;

export default function ProfileScreen() {
  const { authState, logout } = useAuth();
  const { t } = useTranslation();
  useProfileQuery();

  const handleLogout = useCallback(() => {
    void logout();
  }, [logout]);

  if (authState.status !== 'authenticated') return null;

  const { firstName, lastName } = authState.user;
  const heading = t('profile.greeting', { firstName, lastName });

  return (
    <ScreenContainer paddingHorizontal={SPACING.profileButtonMargin}>
      <View style={styles.header}>
        <Pressable
          onPress={handleLogout}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.logout')}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Ionicons
            name="log-out-outline"
            size={DIMENSIONS.headerIcon.size}
            color={COLORS.textPrimary}
          />
        </Pressable>

        <AppText variant="profileHeading" style={styles.heading}>{heading}</AppText>

        <View style={styles.spacer} />
      </View>

      <AppButton
        label={t('profile.logoutButton')}
        variant="secondary"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.headerTop,
  },
  heading: {
    flex: 1,
    marginRight: HEADER_ICON_SIZE,
  },
  spacer: {
    width: HEADER_ICON_SIZE,
  },
  logoutButton: {
    marginTop: SPACING.profileButtonTop,
  },
  pressed: {
    opacity: 0.7,
  },
});
