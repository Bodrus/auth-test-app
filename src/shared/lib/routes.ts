import type { Href } from 'expo-router';

export const ROUTES = {
  public: {
    home: '/(public)/home' as Href,
    login: '/(public)/login' as Href,
  },
  protected: {
    profile: '/(protected)/profile' as Href,
  },
};
