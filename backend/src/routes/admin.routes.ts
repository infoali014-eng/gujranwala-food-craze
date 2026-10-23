import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin';
import { validate } from '../middleware/validate';
import { updateDealSchema, updateMemberStatsSchema } from '../validators/admin.schema';
import {
  getAdminReviewsHandler,
  deleteReviewHandler,
  restoreReviewHandler,
  updateDealHandler,
  updateMemberStatsHandler,
} from '../controllers/admin.controller';

const router = Router();

// All routes here require authentication & admin role verification
router.use(requireAdmin);

// Reviews Moderation
router.get('/reviews', getAdminReviewsHandler);
router.delete('/reviews/:id', deleteReviewHandler);
router.post('/reviews/:id/restore', restoreReviewHandler);

// Site Controls
router.put('/deal', validate(updateDealSchema), updateDealHandler);
router.put('/stats/members', validate(updateMemberStatsSchema), updateMemberStatsHandler);

export default router;
