import rateLimit from 'express-rate-limit';

export const reviewRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reviews per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  handler: (_req, res) => {
    res.status(429).json({
      data: null,
      error: 'Aap is ghante mein mazeed reviews submit nahi kar saktay. Please thori der baad try karein.',
    });
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300, // 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});
