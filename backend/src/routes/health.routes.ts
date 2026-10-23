import { Router, Request, Response } from 'express';
import { isEnvConfigured } from '../config/env';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const envConfigured = isEnvConfigured();

  res.status(200).json({
    data: {
      ok: true,
      envConfigured,
      status: 'ok',
      service: 'gujranwala-food-craze-api',
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
});

export default router;
