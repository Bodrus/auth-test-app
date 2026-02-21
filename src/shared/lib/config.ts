import { z } from 'zod';

const configSchema = z.object({
  apiBaseUrl: z.url(),
  tokenExpiresInMins: z.number().positive(),
  pollingIntervalMs: z.number().positive(),
  requestTimeoutMs: z.number().positive(),
});

export const config = configSchema.parse({
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://dummyjson.com',
  tokenExpiresInMins: 1,
  pollingIntervalMs: 30_000,
  requestTimeoutMs: 10_000,
});

export type AppConfig = z.infer<typeof configSchema>;
