import { z } from 'zod';

export const PointsEndpointSchema = z.object({
  properties: z.object({
    forecast: z.url(),
    relativeLocation: z
      .object({
        properties: z.object({
          city: z.string(),
          state: z.string(),
        }),
      })
      .optional(),
  }),
});

export const PeriodSchema = z.object({
  number: z.number(),
  name: z.string(),
  temperature: z.number(),
  startTime: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/, 'Invalid ISO 8601 datetime with timezone'),
  temperatureUnit: z.enum(['F', 'C']),
  shortForecast: z.string(),
});

export const ForecastEndpointSchema = z.object({
  properties: z.object({
    periods: z.array(PeriodSchema).min(1, 'At least one forecast period is required'),
  }),
});
