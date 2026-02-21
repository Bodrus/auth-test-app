import { z } from 'zod';

import { http } from '@/shared/api';
import { config } from '@/shared/lib';
import type { LoginRequest, LoginResponse, RefreshResponse, User } from '@/entities/user';

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string(),
  image: z.string(),
});

const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

const loginResponseSchema = userSchema.extend(tokensSchema.shape);

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await http.post('/auth/login', {
      ...data,
      expiresInMins: config.tokenExpiresInMins,
    });
    return loginResponseSchema.parse(response.data);
  },

  getMe: async (): Promise<User> => {
    const response = await http.get('/auth/me');
    return userSchema.parse(response.data);
  },

  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await http.post('/auth/refresh', {
      refreshToken,
      expiresInMins: config.tokenExpiresInMins,
    });
    return tokensSchema.parse(response.data);
  },
};
