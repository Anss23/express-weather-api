import express from 'express';
import router from './routes';
import { EnvSchema } from './schemas';
import z from 'zod';
import { globalErrorHandler, createRateLimiter } from './helpers';
import cors from 'cors';
import { OpenAPIV2 } from 'openapi-types';
import swaggerJson from './swagger-output.json';
import swaggerUi from 'swagger-ui-express';
import { RateLimitRequestHandler } from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;

// Nipping configuration errors in the bud
const envResult = EnvSchema.safeParse(process.env);

if (!envResult.success) {
  console.error('Invalid environment variables:');
  console.error(z.treeifyError(envResult.error));
  process.exit(1);
}

// Adding rate limits, though it will only provide instance level limits if the API is running in a cluster or behind an API Gateway
// because we are using in-memory store. For true, global rate limits, we will either have to use a cache service (like Redis) as a memory store or apply
// rate limits on a global (Cluster, API Gateway) level
const rateLimiter: RateLimitRequestHandler = createRateLimiter();

// Allowing all origins and headers in CORS verbs for the sake of demonstration
app.use(
  cors({
    origin: '*',
    methods: ['GET'],
    allowedHeaders: '*',
    credentials: false,
  }),
);
app.use(rateLimiter);
app.use(express.json());

// Serve OpenAPI docs at /api
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerJson as OpenAPIV2.Document));

app.use('/', router);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
