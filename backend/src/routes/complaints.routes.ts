import { Router } from 'express';
import { createComplaintHandler } from '../controllers/complaints.controller';
import { reviewRateLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// POST /api/complaints
router.post('/', reviewRateLimiter, asyncHandler(createComplaintHandler));

export default router;
