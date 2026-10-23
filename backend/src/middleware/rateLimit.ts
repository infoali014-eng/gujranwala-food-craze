import rateLimit from 'express-rate-limit';

export const reviewRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reviews per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      data: null,
      error: {
        message: 'Aap is ghante mein mazeed reviews submit nahi kar saktay. Please 1 ghante baad try karein. (Limit: 3 per hour)',
      },
    });
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 150, // 150 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
