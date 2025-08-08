import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

export const createRateLimiter = (): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_IN_SECONDS) * 1000,
    max: Number(process.env.RATE_LIMIT_REQUESTS_PER_WINDOW),
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
};
