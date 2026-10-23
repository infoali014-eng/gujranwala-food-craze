import { Router } from 'express';
import { getReviewsHandler, createReviewHandler } from '../controllers/reviews.controller';
import { validate } from '../middleware/validate';
import { reviewRateLimiter } from '../middleware/rateLimit';
import { createReviewSchema } from '../validators/review.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// GET /api/reviews
router.get('/', asyncHandler(getReviewsHandler));

// POST /api/reviews (rate limited to 3 per IP per hour, Zod validated)
router.post(
  '/',
  reviewRateLimiter,
  validate(createReviewSchema),
  asyncHandler(createReviewHandler)
);

export default router;
