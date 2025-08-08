import { NextFunction, Request, Response } from 'express';
import { checkServiceHealth } from '../services/weather.service';
import { HttpStatus } from '../constants';
import { logger } from '../helpers/logger';

/**
 * Liveness probe, shows that the pod/container is up and running
 */
export const healthLiveness = (req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({ message: 'Service is up and running' });
};

/**
 * Readiness probe, shows that the service is ready to serve
 */
export const healthReadiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAlive = await checkServiceHealth();

    if (!isAlive) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ message: 'Service is not ready to use' });
      return;
    }

    res.status(HttpStatus.OK).json({ message: 'Service is ready to use' });
  } catch (error) {
    logger.error('Health readiness check failed', error as Error, {
      endpoint: 'healthReadiness',
      url: req.originalUrl || req.url,
    });
    next(error);
  }
};
