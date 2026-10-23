import { Router } from 'express';
import {
  getCurrentDealHandler,
  getMembersStatsHandler,
  getSiteSettingsHandler,
  trackClickHandler,
} from '../controllers/site.controller';
import { validate } from '../middleware/validate';
import { trackClickSchema } from '../validators/track.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// GET /api/deals/current
router.get('/deals/current', asyncHandler(getCurrentDealHandler));

// GET /api/stats/members
router.get('/stats/members', asyncHandler(getMembersStatsHandler));

// GET /api/settings/links
router.get('/settings/links', asyncHandler(getSiteSettingsHandler));

// POST /api/track/click
router.post('/track/click', validate(trackClickSchema), asyncHandler(trackClickHandler));

export default router;
