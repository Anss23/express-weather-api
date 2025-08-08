import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants';
import { getForecastByGeolocation } from '../services/weather.service';

/**
 * Core API logic, accepts lat,lng and returns weather forecast for the area
 */
export const getForecastByCoordinates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // lat, lng are safe to parse here because they have been type checked on the validation step
    const forecastData = await getForecastByGeolocation(Number(req.query.lat), Number(req.query.lng));

    res.status(HttpStatus.OK).json(forecastData);
  } catch (error) {
    next(error);
  }
};
