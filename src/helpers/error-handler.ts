import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpStatus } from '../constants';
import { HttpError, NWSApiError } from '../helpers/errors/http-error';
import { logger } from './logger';

/**
 * This is the global error handler; all the errors come here before being sent to the client or logged
 * @param error
 * @param req
 * @param res
 * @param next
 * @returns
 */

// Below is the only place where I had to disable lint for a line, the error is on _next. Express requires it in the signature
// and es lint is complaining about an unused variable

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const globalErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Logging the error at a centralized place
  logger.error('Global error handler caught error', error, {
    url: req.originalUrl || req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  if (error instanceof ZodError) {
    const errorMessages = error.issues.map((issue) => ({
      message: `${issue.path.join('.')} is ${issue.message}`,
    }));

    return res.status(HttpStatus.VALIDATION_FAILED).json({
      error: 'Validation failed',
      details: errorMessages,
    });
  }

  if (error instanceof NWSApiError) {
    const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;

    if (statusCode === HttpStatus.REQUEST_TIMEOUT) {
      return res.status(statusCode).json({
        error: 'Request timed out',
        message: error.message,
        coordinates: error.coordinates,
        operation: error.operation,
      });
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return res.status(statusCode).json({
        error: 'Something went wrong',
        message: error.message,
        coordinates: error.coordinates,
        operation: error.operation,
      });
    }

    // Handling other errors in a generic fashion
    return res.status(statusCode).json({
      error: 'Weather Service Error',
      message: error.message,
      coordinates: error.coordinates,
      operation: error.operation,
    });
  }

  if (error instanceof HttpError) {
    const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;

    if (error.status === HttpStatus.NOT_FOUND) {
      return res.status(statusCode).json({
        error: 'Location not found',
        message: 'The requested coordinates are not supported by the weather service',
      });
    }

    if (error.status >= HttpStatus.BAD_REQUEST && error.status < HttpStatus.INTERNAL_SERVER_ERROR) {
      return res.status(statusCode).json({
        error: 'Request failed',
        message: error.title,
      });
    }

    if (error.status === HttpStatus.REQUEST_TIMEOUT) {
      return res.status(statusCode).json({
        error: 'Request timed out, please try again',
        message: error.title || 'Invalid request',
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Service temporarily unavailable',
      message: 'Weather data is currently unavailable. Please try again later.',
    });
  }

  // Default to 500 for unknown errors
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    error: 'Internal Server Error',
  });
};
