import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * This is the central validator for all the input to the API via endpoints
 * It handles params, query, and body parameters
 * @param param
 * @returns
 */
export function validateRequest({ params, query, body }: { params?: z.ZodType; query?: z.ZodType; body?: z.ZodType }) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (params) {
        params.parse(req.params);
      }

      if (query) {
        query.parse(req.query);
      }

      if (body) {
        body.parse(req.body);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
