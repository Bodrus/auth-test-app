import type { Translations } from './en';

export const uk: Translations = {
  home: {
    goToLogin: 'Увійти',
  },

  login: {
    usernameLabel: "Ім'я користувача",
    passwordLabel: 'Пароль',
    submitButton: 'Увійти',
  },

  profile: {
    greeting: 'Привіт, {{firstName}} {{lastName}}!',
    logoutButton: 'Вийти',
  },

  validation: {
    usernameRequired: "Ім'я користувача обов'язкове",
    usernameInvalid: "Ім'я користувача невалідне",
    passwordRequired: "Пароль обов'язковий",
    passwordInvalid: 'Пароль невалідний',
  },

  accessibility: {
    clearInput: 'Очистити поле',
    logout: 'Вийти',
  },

  errors: {
    invalidCredentials: "Невірне ім'я користувача або пароль",
    networkError: "Помилка мережі. Перевірте з'єднання.",
    generic: 'Щось пішло не так. Спробуйте ще раз.',
    boundaryTitle: 'Щось пішло не так',
    boundarySubtitle: 'Виникла неочікувана помилка. Спробуйте ще раз.',
    boundaryRetry: 'Спробувати знову',
  },
};
