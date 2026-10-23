import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin';
import { validate } from '../middleware/validate';
import {
  updateDealSchema,
  updateMemberStatsSchema,
  updateLinksSchema,
} from '../validators/admin.schema';
import {
  getAdminReviewsHandler,
  deleteReviewHandler,
  restoreReviewHandler,
  updateDealHandler,
  updateMemberStatsHandler,
  updateSiteSettingsHandler,
} from '../controllers/admin.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All routes here require authentication & admin role verification
router.use(requireAdmin);

// Reviews Moderation
router.get('/reviews', asyncHandler(getAdminReviewsHandler));
router.delete('/reviews/:id', asyncHandler(deleteReviewHandler));
router.post('/reviews/:id/restore', asyncHandler(restoreReviewHandler));

// Site Controls
router.put('/deal', validate(updateDealSchema), asyncHandler(updateDealHandler));
router.put('/stats/members', validate(updateMemberStatsSchema), asyncHandler(updateMemberStatsHandler));
router.put('/settings/links', validate(updateLinksSchema), asyncHandler(updateSiteSettingsHandler));

export default router;
