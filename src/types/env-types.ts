import z from 'zod';
import { EnvSchema } from '../schemas';

export type EnvConfig = z.infer<typeof EnvSchema>;
