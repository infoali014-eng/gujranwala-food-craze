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
import {
  getComplaintsHandler,
  updateComplaintHandler,
  deleteComplaintHandler,
  restoreComplaintHandler,
} from '../controllers/complaints.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All routes here require authentication & admin role verification
router.use(requireAdmin);

// Reviews Moderation
router.get('/reviews', asyncHandler(getAdminReviewsHandler));
router.delete('/reviews/:id', asyncHandler(deleteReviewHandler));
router.post('/reviews/:id/restore', asyncHandler(restoreReviewHandler));

// Complaints Inbox
router.get('/complaints', asyncHandler(getComplaintsHandler));
router.patch('/complaints/:id', asyncHandler(updateComplaintHandler));
router.delete('/complaints/:id', asyncHandler(deleteComplaintHandler));
router.post('/complaints/:id/restore', asyncHandler(restoreComplaintHandler));

// Site Controls
router.put('/deal', validate(updateDealSchema), asyncHandler(updateDealHandler));
router.put('/stats/members', validate(updateMemberStatsSchema), asyncHandler(updateMemberStatsHandler));
router.put('/settings/links', validate(updateLinksSchema), asyncHandler(updateSiteSettingsHandler));

export default router;
