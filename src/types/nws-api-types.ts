import z from 'zod';
import { PeriodSchema, PointsEndpointSchema } from '../schemas';

export type PointsEndpoint = `/points/${string},${string}`;
export type ForecastEndpoint = `/points/${string},${string}`;
export type Forecast = z.infer<typeof PeriodSchema>;
export type Point = z.infer<typeof PointsEndpointSchema>;
