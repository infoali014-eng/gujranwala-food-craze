import { Router } from 'express';
import {
  getCurrentDealHandler,
  getMembersStatsHandler,
  trackClickHandler,
} from '../controllers/site.controller';
import { validate } from '../middleware/validate';
import { trackClickSchema } from '../validators/track.schema';

const router = Router();

// GET /api/deals/current
router.get('/deals/current', getCurrentDealHandler);

// GET /api/stats/members
router.get('/stats/members', getMembersStatsHandler);

// POST /api/track/click
router.post('/track/click', validate(trackClickSchema), trackClickHandler);

export default router;
