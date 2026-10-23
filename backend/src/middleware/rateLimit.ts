import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env';

const reviewLimit = ENV.REVIEW_RATE_LIMIT_PER_HOUR;

const reviewLimiterInstance = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: reviewLimit,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  handler: (_req, res) => {
    res.status(429).json({
      data: null,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Aap bohat jaldi note bhej rahe hain. Thori der baad try karein.',
      },
    });
  },
});

export const reviewRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  try {
    reviewLimiterInstance(req, res, (err) => {
      if (err) {
        console.error('[RateLimiter Error - continuing request]:', err);
        return next();
      }
      next();
    });
  } catch (err) {
    console.error('[RateLimiter Exception - continuing request]:', err);
    next();
  }
};

const generalLimiterInstance = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

export const generalRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  try {
    generalLimiterInstance(req, res, (err) => {
      if (err) {
        console.error('[GeneralRateLimiter Error - continuing request]:', err);
        return next();
      }
      next();
    });
  } catch (err) {
    console.error('[GeneralRateLimiter Exception - continuing request]:', err);
    next();
  }
};
