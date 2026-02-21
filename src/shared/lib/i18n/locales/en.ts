export const en = {
  home: {
    goToLogin: 'Go to login',
  },

  login: {
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    submitButton: 'Login',
  },

  profile: {
    greeting: 'Hi, {{firstName}} {{lastName}}!',
    logoutButton: 'Logout',
  },

  validation: {
    usernameRequired: 'Username is required',
    usernameInvalid: 'Username is invalid',
    passwordRequired: 'Password is required',
    passwordInvalid: 'Password is invalid',
  },

  accessibility: {
    clearInput: 'Clear input',
    logout: 'Log out',
  },

  errors: {
    invalidCredentials: 'Invalid username or password',
    networkError: 'Network error. Check your connection.',
    generic: 'Something went wrong. Please try again.',
    boundaryTitle: 'Something went wrong',
    boundarySubtitle: 'An unexpected error occurred. Please try again.',
    boundaryRetry: 'Try again',
  },
} as const;

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type Translations = DeepStringify<typeof en>;
