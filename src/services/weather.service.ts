import { HttpStatus, WEATHER_API_URL, WEATHER_API_HEADER } from '../constants';
import { httpGetValidated, ping } from '../helpers';
import { HttpError, NWSApiError } from '../helpers/errors/http-error';
import { PointsEndpoint, Forecast, Point } from '../types';
import { ForecastEndpointSchema, PointsEndpointSchema } from '../schemas';
import { logger } from '../helpers/logger';
import { ZodError } from 'zod';

/**
 * Pings weather service to see if its up and running
 * @returns boolean
 */
export const checkServiceHealth = async () => {
  logger.info('Checking weather service health');
  const result = await ping(WEATHER_API_URL);

  if (result === HttpStatus.OK) {
    logger.info('Weather service is healthy');
    return true;
  }

  logger.error('Weather service is unhealthy');
  return false;
};

/**
 * Gets forecast via lat, lng
 * @param lat
 * @param lng
 * @returns {{ feel: "hot" | "cold" | "moderate", forecast: string, location: string, date: string }}
 */
export const getForecastByGeolocation = async (lat: number, lng: number) => {
  const coordinates = `${lat},${lng}`;
  logger.info(`Getting forecast for coordinates: ${coordinates}`);

  try {
    // Step 1: Get forecast URL from API
    const endpoint: PointsEndpoint = `/points/${lat},${lng}`;
    const url = `${WEATHER_API_URL}/${endpoint}`;
    logger.debug(`Fetching points data from: ${url}`);
    const pointsResult = await httpGetValidated(url, PointsEndpointSchema, WEATHER_API_HEADER);

    // Step 2: Get forecast from received URL
    const forecastUrl = pointsResult.properties.forecast;

    if (!forecastUrl) {
      throw new NWSApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        `No forecast URL available for coordinates ${coordinates}`,
        'getForecast',
        coordinates,
      );
    }

    logger.debug(`Fetching forecast from: ${forecastUrl}`);
    const forecasts = await httpGetValidated(forecastUrl, ForecastEndpointSchema, WEATHER_API_HEADER);

    // Making an educated guess (by trying out the API) here that API always returns sorted forecasts, based on date
    // so the most recent one is current forecast
    const response = prepareResponse(forecasts.properties.periods[0], pointsResult);
    logger.info(`Successfully retrieved forecast for ${coordinates}`);

    return response;
  } catch (error) {
    // This exception would handle all the malformed response from the weather API
    if (error instanceof ZodError) {
      throw new NWSApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        `Weather service returned invalid data format for coordinates ${coordinates}`,
        'getForecast',
        coordinates,
        error,
      );
    }

    // This exception would handle all the HTTP request errors that may happen
    if (error instanceof HttpError) {
      throw new NWSApiError(
        error.status,
        `Failed to get weather forecast for coordinates ${coordinates}`,
        'getForecast',
        coordinates,
        error,
      );
    }

    throw error;
  }
};

const prepareResponse = (forecast: Forecast, point: Point) => {
  return {
    feel: predictWeatherFeel(forecast.temperature, forecast.temperatureUnit),
    forecast: forecast.shortForecast,
    location: `${point.properties.relativeLocation?.properties.city}, ${point.properties.relativeLocation?.properties.state}`,
    date: forecast.startTime.split('T')[0],
  };
};

const predictWeatherFeel = (temperature: number, unit: 'F' | 'C'): 'hot' | 'cold' | 'moderate' => {
  if (unit === 'F') {
    if (temperature >= 80) return 'hot';
    if (temperature <= 50) return 'cold';
    return 'moderate';
  }

  if (unit === 'C') {
    if (temperature >= 27) return 'hot';
    if (temperature <= 10) return 'cold';
    return 'moderate';
  }

  return 'cold'; // Heat death of the universe; cold is an understatement
};
