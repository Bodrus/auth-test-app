import { StyleSheet, View } from 'react-native';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/shared/lib';
import { AppButton, ErrorBanner, FloatingLabelInput } from '@/shared/ui';

import { useLoginForm } from '../model';
import type { LoginFormData } from '../lib';

export const LoginForm = () => {
  const { t } = useTranslation();
  const { form, onSubmit, isLoading, serverError, resetServerError } =
    useLoginForm();

  const [username, password] = useWatch<LoginFormData>({ control: form.control, name: ['username', 'password'] });
  const isIncomplete = !username || !password;

  return (
    <View>
      <Controller
        control={form.control}
        name="username"
        render={({ field, fieldState }) => (
          <View style={styles.inputWrapper}>
            <FloatingLabelInput
              label={t('login.usernameLabel')}
              value={field.value}
              onChangeText={(text) => {
                field.onChange(text);
                resetServerError();
              }}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              editable={!isLoading}
              onClear={() => {
                field.onChange('');
                resetServerError();
              }}
            />
          </View>
        )}
      />

      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <View style={styles.inputWrapper}>
            <FloatingLabelInput
              label={t('login.passwordLabel')}
              value={field.value}
              onChangeText={(text) => {
                field.onChange(text);
                resetServerError();
              }}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              secureTextEntry
              editable={!isLoading}
              onClear={() => {
                field.onChange('');
                resetServerError();
              }}
            />
          </View>
        )}
      />

      {serverError ? (
        <ErrorBanner message={serverError} style={styles.bannerWrapper} />
      ) : null}

      <AppButton
        label={t('login.submitButton')}
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading || isIncomplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: SPACING.betweenInputs,
  },
  bannerWrapper: {
    marginBottom: SPACING.bannerToButton,
  },
});
