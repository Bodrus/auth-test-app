import i18n from 'i18next';
import { z } from 'zod';

export const createLoginSchema = () =>
  z.object({
    username: z
      .string()
      .min(1, i18n.t('validation.usernameRequired'))
      .min(3, i18n.t('validation.usernameInvalid')),
    password: z
      .string()
      .min(1, i18n.t('validation.passwordRequired'))
      .min(6, i18n.t('validation.passwordInvalid')),
  });

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
