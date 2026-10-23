import { Router } from 'express';
import { getReviewsHandler, createReviewHandler } from '../controllers/reviews.controller';
import { deleteReviewHandler, restoreReviewHandler } from '../controllers/admin.controller';
import { requireAdmin } from '../middleware/requireAdmin';
import { validate } from '../middleware/validate';
import { reviewRateLimiter } from '../middleware/rateLimit';
import { createReviewSchema } from '../validators/review.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// GET /api/reviews
router.get('/', asyncHandler(getReviewsHandler));

// POST /api/reviews (rate limited, Zod validated)
router.post(
  '/',
  reviewRateLimiter,
  validate(createReviewSchema),
  asyncHandler(createReviewHandler)
);

// Admin review actions supported on /api/reviews/:id
router.delete('/:id', requireAdmin, asyncHandler(deleteReviewHandler));
router.patch('/:id/restore', requireAdmin, asyncHandler(restoreReviewHandler));
router.post('/:id/restore', requireAdmin, asyncHandler(restoreReviewHandler));

export default router;
