import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['local', 'development', 'staging', 'production']).default('local'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  WEATHER_API_URL: z.url('Weather API URL must be a valid URL'),
  RATE_LIMIT_WINDOW_IN_SECONDS: z.coerce.number(),
  RATE_LIMIT_REQUESTS_PER_WINDOW: z.coerce.number(),
});
