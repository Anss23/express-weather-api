import express from 'express';
import { healthLiveness, healthReadiness } from './controllers/health.controller';
import { getForecastByCoordinates } from './controllers/weather.controller';
import { validateRequest } from './helpers';
import { getForecastByLatLngSchema } from './schemas';

const router = express.Router();

/**
 * GET /health/live
 * #swagger.tags = ['Health']
 * #swagger.description = 'Check if the service is alive'
 * #swagger.responses[200] = { description: 'Service is alive' }
 */
router.get('/health/live', healthLiveness);

/**
 * GET /health/ready
 * #swagger.tags = ['Health']
 * #swagger.description = 'Check if the service is ready to accept requests'
 * #swagger.responses[200] = { description: 'Service is ready' }
 */
router.get('/health/ready', healthReadiness);

/**
 * GET /weather/forecast
 * #swagger.tags = ['Weather']
 * #swagger.description = 'Get weather forecast by coordinates'
 * #swagger.parameters['lat'] = { in: 'query', description: 'Latitude', required: true, type: 'number' }
 * #swagger.parameters['lng'] = { in: 'query', description: 'Longitude', required: true, type: 'number' }
 * #swagger.responses[200] = { description: 'Weather forecast data' }
 * #swagger.responses[400] = { description: 'Invalid coordinates' }
 */
router.get('/weather/forecast', validateRequest({ query: getForecastByLatLngSchema }), getForecastByCoordinates);

export default router;
